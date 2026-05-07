import { createServer } from '#/server/server.js'
import { statusCodes } from '#/server/common/constants/status-codes.js'

describe('#searchController', () => {
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
      url: '/',
      auth: {
        strategy: 'azure-ad-jwt',
        credentials: {
          decoded: {},
          token: ""
        }
      }
    })

    expect(result).toEqual(expect.stringContaining('Search |'))
    expect(statusCode).toBe(statusCodes.ok)
  })
})
