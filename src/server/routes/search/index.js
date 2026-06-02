import { searchController, resultsController } from './controller.js'

import { searchService } from './service.js'

import { config } from '#/config/config.js'

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
          handler: (_, h) => h.redirect('/search')
        }
      ])
      server.route([
        {
          method: 'GET',
          path: '/search',
          ...searchController
        }
      ])
      server.route([
        {
          method: 'POST',
          path: '/search-results',
          ...resultsController(searchService(config.get("pegasusBaseUrl"), fetch))
        }
      ])
    }
  }
}
