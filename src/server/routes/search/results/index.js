import { searchResultsController } from './controller.js'

/**
 * Sets up the routes used in the home page.
 * These routes are registered in src/server/router.js.
 */
export const results = {
  plugin: {
    name: 'results',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/results',
          ...searchResultsController
        }
      ])
    }
  }
}
