import { createServer } from '#/server/server.js'
import { describe, beforeAll, afterAll, test, expect, vi } from 'vitest'
import { Server } from '@hapi/hapi'
import { checkController } from './controller'

describe('#checkController', () => {
  /** @type Server<import('@hapi/hapi').ServerApplicationState> */
  let server;

  /**
   * @type {import('../search/service').SearchService}
   */
  let mockService;

  beforeAll(async () => {
    server = await createServer()

    mockService = ({
      lookupOne: async () => ({
        ok: true,
        value: {
          permitId: "7db9f1c1-203e-4ddc-80e7-9126116ef698",
          permitNumber: "25GBIMPUA93QA",
          validityDate: new Date("2026-05-31"),
          status: "Valid",
          scientificName: "Scientific name",
          commonName: null,
          specimenDescription: null,
          citesAppendix: "II",
          exporterName: null,
          exporterAddress: null,
          importerName: null,
          importerAddress: null,
          originPermitNumber: "TEST_ORIGIN_PERMIT_NUMBER",
          countryOfOrigin: "TEST_COUNTRY_OF_ORIGIN",
          countryOfExport: "TEST_COUNTRY_OF_EXPORT",
          countryOfImport: "TEST_COUNTRY_OF_IMPORT",
          countryOfReExport: "TEST_COUNTRY_OF_REEXPORT",
          countryOfLastReExport: "TEST_COUNTRY_OF_LAST_REEXPORT",
          gbAnnex: null,
          sourceCode: null,
          purposeCode: null,
          amount: { quantity: 1 },
          specialConditions: null
        }
      }),
      lookupMany: async () => ({}),
      endorseOne: async () => ({
        ok: false,
        error: {
          status: 500
        }
      })
    })

    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should provide expected response', async () => {
    const mockView = vi.fn()
    const stateGet = vi.fn()
    const stateSet = vi.fn()

    const { handler } = checkController(mockService)

    await handler({
      query: {
        permitNumber: "25GBIMPUA93QA"
      },
      // @ts-ignore
      yar: {
        get: stateGet,
        set: stateSet,
        flash: vi.fn()
      },
      // @ts-ignore
      auth: { credentials: { token: "TEST_TOKEN" } }
    },
      { view: mockView }
    )

    expect(mockView).calledOnceWith(
      'check/index', {
      heading: "Check",
      pageTitle: "Check permit details",
      nav: undefined,
      permit: {
        permitId: "7db9f1c1-203e-4ddc-80e7-9126116ef698",
        permitNumber: "25GBIMPUA93QA",
        statusLabel: "Valid",
        statusLabelColour: "blue",
        isExportNotImport: false,
        validityDate: "31 May 2026",
        scientificName: "Scientific name",
        citesAppendix: "II",
        commonName: null,
        specimenDescription: null,
        exporterName: null,
        exporterAddress: undefined,
        importerName: null,
        importerAddress: undefined,
        countryOfOrigin: "TEST_COUNTRY_OF_ORIGIN",
        countryOfExport: "TEST_COUNTRY_OF_EXPORT",
        countryOfImport: "TEST_COUNTRY_OF_IMPORT",
        countryOfReExport: "TEST_COUNTRY_OF_REEXPORT",
        countryOfLastReExport: "TEST_COUNTRY_OF_LAST_REEXPORT",
        gbAnnex: null,
        sourceCode: null,
        purposeCode: null,
        specialConditions: null,
        amount: {
          "quantity": 1,
          "unitText": undefined,
          "unitTextLong": undefined
        },
        mrn: ""
      }
    })
  })
})
