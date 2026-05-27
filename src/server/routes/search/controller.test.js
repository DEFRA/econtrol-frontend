import { describe, test, it, expect, vi, afterAll, beforeAll } from 'vitest';
import { createServer } from '#/server/server.js'
import { statusCodes } from '#/server/common/constants/status-codes.js'
import { resultsController } from '#/server/routes/search/controller.js'
import { Server } from '@hapi/hapi';

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

  test('invalid permit numbers displays errors', async () => {
    /**
     * @param {string} _token
     * @param {function} _fetch
     */
    const mockService = (_token, _fetch) => ({
      lookupOne: () => ({}),
      lookupMany: async () => ({
        "25GBIMPUA93QA": {
          ok: true,
          json: async () => Object.freeze({
            validityDate: "2026-05-10",
            permitNumber: "25GBIMPUA93QA"
          })
        },
        "26GBEXP000404": {
          ok: false,
          json: async () => Object.freeze({})
        }
      })
    })

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
      auth: { credentials: { token: "TEST_TOKEN" } }
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
        validityDate: "10 May 2026",
        permitNumber: "25GBIMPUA93QA",
        isExportNotImport: false,
        statusLabel: undefined
      }]
    }
    )
  })
})
