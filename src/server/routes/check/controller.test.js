import { createServer } from '#/server/server.js'
import { describe, beforeAll, afterAll, test, expect, vi } from 'vitest'
import { Server } from '@hapi/hapi'
import { checkController } from './controller'

describe('#checkController', () => {
  /** @type Server<import('@hapi/hapi').ServerApplicationState> */
  let server;

  /**
   * @type {import('../search/service').SearchServiceFactory}
   */
  let mockService;

  beforeAll(async () => {
    server = await createServer()

    mockService = (_token, _fetch) => ({
      lookupOne: async () => ({
        ok: true,
        value: {
          permitId: "7db9f1c1-203e-4ddc-80e7-9126116ef698",
          permitNumber: "25GBIMPUA93QA",
          validityDate: new Date("2026-05-31"),
          status: "Valid",
          scientificName: "Scientific name"
        }
      }),
      lookupMany: async () => ({}),
      endorseOne: async () => ({
        ok: false,
        status: 500
      })
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
      // @ts-ignore
      auth: { credentials: { token: "TEST_TOKEN" } }
    },
      { view: mockView }
    )

    expect(mockView).calledOnceWith(
      'check/index', {
      "heading": "Check",
      "pageTitle": "Check permit details",
      "permit": {
        "permitId": "7db9f1c1-203e-4ddc-80e7-9126116ef698",
        "permitNumber": "25GBIMPUA93QA",
        "statusLabel": "Valid",
        "isExportNotImport": false,
        "validityDate": "31 May 2026",
        "scientificName": "Scientific name",
      }
    })
  })
})
