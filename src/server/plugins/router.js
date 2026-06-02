import inert from '@hapi/inert'

import { auth } from '../routes/auth/index.js'
import { search } from '../routes/search/index.js'
import { check } from '../routes/check/index.js'
import { health } from '../routes/health/index.js'
import { serveStaticFiles } from './serve-static-files.js'
import { config } from '#/config/config.js'
import { notFound } from '@hapi/boom'
import { finished } from 'node:stream/promises'
import connect from 'connect'

const hapiconnect = {
  name: 'connect',
  version: '0.1.0',
  description: 'Mount `connect` based middleware at a route',
  register: async function (server, options) {
    const { path, middleware, auth } = options

    const app = connect()

    server.route({
      method: '*',
      path: `${path}/{param*}`,
      options: {
        auth
      },
      handler: async (request, h) => {
        for (const item of middleware) {
          app.use(path, item)
        }

        const { req, res } = request.raw

        const { promise: next, resolve: resolveNext } = Promise.withResolvers()
        app(req, res, () => resolveNext(true))

        const nextCalled = await Promise.race([finished(res), next])

        if (nextCalled) {
          return notFound()
        }

        return h.abandon
      }
    })
  }
}

export const router = {
  plugin: {
    name: 'router',
    async register(server) {
      await server.register([inert])

      // Health-check route. Used by platform to check if service is running, do not remove!
      await server.register([health])

      // Application specific routes, add your own routes here
      await server.register([auth, search, check])


      // Static assets
      if (!config.get('isProduction') && !config.get('isTest')) {
        await (async () => {
          const createViteServer = (await import('vite')).createServer
          const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'custom'
          })

          await server.register({
            plugin: hapiconnect,
            options: {
              path: '/public',
              middleware: [vite.middlewares],
              auth: false
            },
          })
        })()
      } else {
        server.register(serveStaticFiles)
      }
    }
  }
}
