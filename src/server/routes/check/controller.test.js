import { createServer } from '#/server/server.js'
import { statusCodes } from '#/server/common/constants/status-codes.js'
import { describe, beforeAll, afterAll, test, expect, vi } from 'vitest'
import { Server } from '@hapi/hapi'
import { checkController } from './controller'

describe('#checkController', () => {
  /** @type Server<import('@hapi/hapi').ServerApplicationState> */
  let server, mockService

  beforeAll(async () => {
    server = await createServer()

    mockService = (_token, _fetch) => ({
      lookupOne: async () => ({
        ok: true,
        json: async () => ({
          validityDate: "2026-05-10",
          permitNumber: "25GBIMPUA93QA"
        })
      }),
      lookupMany: async () => ({})
    })

    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should provide expected response', async () => {
    const mockView = vi.fn()

    const { handler } = checkController(mockService)

    await handler({
      query: {
        permitNumber: "25GBIMPUA93QA"
      },
      auth: { credentials: { token: "TEST_TOKEN" } }
    },
      { view: mockView }
    )

    expect(mockView).calledOnceWith(
      'check/index', {
      "heading": "Check",
      "pageTitle": "Check permit details",
      "permit": {
        "isExportNotImport": false,
        "permitNumber": "25GBIMPUA93QA",
        "statusLabel": undefined,
        "validityDate": "10 May 2026",
      },
    }
    )
  })
})
//describe('#resultsController', () => {
//
//  test('invalid permit numbers displays errors', async () => {
//    /**
//     * @param {string} _token
//     * @param {function} _fetch
//     */
//    const mockService = (_token, _fetch) => ({
//      lookupOne: () => ({}),
//      lookupMany: async () => ({
//        "25GBIMPUA93QA": {
//          ok: true,
//          json: async () => Object.freeze({
//            validityDate: "2026-05-10",
//            permitNumber: "25GBIMPUA93QA"
//          })
//        },
//        "26GBEXP000404": {
//          ok: false,
//          json: async () => Object.freeze({})
//        }
//      })
//    })
//
//    const mockView = vi.fn()
//
//    const { handler } = resultsController(mockService)
//
//    await handler({
//      payload: {
//        permitReferences: `
//          bananas
//          25GBIMPUA93QA
//          26GBEXP000404
//          `
//      },
//      auth: { credentials: { token: "TEST_TOKEN" } }
//    },
//      { view: mockView }
//    )
//
//    expect(mockView).calledOnceWith(
//      'search/results', {
//      "errors": [
//        "26GBEXP000404",
//        "bananas"
//      ],
//      "heading": "Results",
//      "pageTitle": "Permit search results",
//      "results": [{
//        validityDate: "10 May 2026",
//        permitNumber: "25GBIMPUA93QA",
//        isExportNotImport: false,
//        statusLabel: undefined
//      }]
//    }
//    )
//  })
