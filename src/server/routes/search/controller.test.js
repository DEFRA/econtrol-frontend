import { describe, test, it, expect, vi, afterAll, beforeAll } from 'vitest';
import { createServer } from '#/server/server.js'
import { statusCodes } from '#/server/common/constants/status-codes.js'
import { resultsController } from '#/server/routes/search/controller.js'
import { Server } from '@hapi/hapi';
import { Unit } from './service';

describe('#searchController', () => {
  /** @type Server<import('@hapi/hapi').ServerApplicationState> */
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should provide expected response', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/search',
      auth: {
        strategy: 'azure-ad-jwt',
        credentials: {
          // @ts-ignore
          decoded: {},
          token: ""
        }
      }
    })

    expect(result).toMatch('Search for CITES permits')
    expect(statusCode).toBe(statusCodes.ok)
  })
})

describe('#resultsController', () => {
  test('no valid permit numbers returns error', async () => {
    /**
     * @type {import('./service').SearchService}
     */
    const mockService = ({
      lookupOne: async () => ({
        ok: false,
        error: {
          status: 500
        }
      }),
      lookupMany: async () => ({}),
      endorseOne: async () => ({
        ok: false,
        error: {
          status: 500
        }
      }),
    })

    const mockView = vi.fn()

    const { handler } = resultsController(mockService)

    await handler({
      payload: {
        permitReferences: "foo\nbar"
      },
      // @ts-ignore
      auth: {
        strategy: 'azure-ad-jwt',
        credentials: { token: "TEST_TOKEN" },
      }
    },
      { view: mockView }
    )

    expect(mockView).calledOnceWith(
      'search/index', {
      pageTitle: 'Search for CITES permits',
      heading: 'Search',
      error: true
    });
  });

  test('invalid permit numbers displays errors', async () => {
    /**
     * @type {import('./service').SearchService}
     */
    const mockService = ({
      lookupOne: async () => ({
        ok: false,
        error: {
          status: 500
        }
      }),
      lookupMany: async () => ({
        "25GBIMPUA93QA": {
          ok: true,
          value: Object.freeze({
            permitId: "577cde72-1db3-4a37-8333-34ae0f8ac4be",
            validityDate: new Date("2026-05-10"),
            permitNumber: "25GBIMPUA93QA",
            status: "Valid",
            scientificName: "Scientific name",
            citesAppendix: "II",
            commonName: null,
            exporterName: null,
            exporterAddress: null,
            importerName: null,
            importerAddress: null,
            gbAnnex: null,
            amount: { mass: 1, unit: Unit.kg }
          })
        },
        "26GBEXP000404": {
          ok: false,
          error: {
            status: 500
          }
        }
      }),
      endorseOne: async () => ({
        ok: false,
        error: {
          status: 500
        }
      }),
    })

    const stateGet = vi.fn()
    const stateSet = vi.fn()
    const mockView = vi.fn()

    const { handler } = resultsController(mockService)

    await handler({
      payload: {
        permitReferences: `
          bananas
          25GBIMPUA93QA
          26GBEXP000404
          `
      },
      // @ts-ignore
      yar: {
        get: stateGet,
        set: stateSet
      },
      // @ts-ignore
      auth: {
        strategy: 'azure-ad-jwt',
        credentials: { token: "TEST_TOKEN" },
      }
    },
      { view: mockView }
    )

    expect(mockView).calledOnceWith(
      'search/results', {
      "errors": [
        "26GBEXP000404",
        "bananas"
      ],
      "heading": "Results",
      "pageTitle": "Permit search results",
      "results": [{
        permitId: "577cde72-1db3-4a37-8333-34ae0f8ac4be",
        permitNumber: "25GBIMPUA93QA",
        statusLabel: "Valid",
        statusLabelColour: "blue",
        validityDate: "10 May 2026",
        scientificName: "Scientific name",
        isExportNotImport: false,
        citesAppendix: "II",
        gbAnnex: null,
        quantity: "1kg"
      }]
    })
  })
})
