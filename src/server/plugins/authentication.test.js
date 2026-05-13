
import { createServer } from '#/server/server.js'

describe('#authentication', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test.each`
  path
  ${"/"}
  ${"/check-permit-details?permitNumber=test"}
      `('$path redirects to login when not authenticated', async ({ path }) => {
    const resp = await server.inject({
      method: 'GET',
      url: path,
    })

    expect(resp.statusCode).toBe(302);
    expect(resp.headers.location).toBe("/auth/login");
  })

  test.each`
  path
  ${"/search"}
      `('$path returns 200 when authenticated', async ({ path }) => {
    const resp = await server.inject({
      method: 'GET',
      url: path,
      auth: {
        strategy: 'azure-ad-jwt',
        credentials: {
          decoded: {},
          token: ""
        }
      }
    })

    expect(resp.statusCode).toBe(200);
  })
})
