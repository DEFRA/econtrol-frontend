import { searchController } from './controller.js'

/**
 * Sets up the routes used in the home page.
 * These routes are registered in src/server/router.js.
 */
export const search = {
  plugin: {
    name: 'search',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/',
          ...searchController
        }
      ])
    },
     register(server) {
      server.route([
        {
          method: 'POST',
          path: '/',
          ...searchController
        }
      ])
    }
  }
}
