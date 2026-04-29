import { checkController } from './controller.js'

/**
 * Sets up the routes used in the home page.
 * These routes are registered in src/server/router.js.
 */
export const check = {
  plugin: {
    name: 'check',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/check',
          ...checkController
        }
      ])
    }
  }
}
