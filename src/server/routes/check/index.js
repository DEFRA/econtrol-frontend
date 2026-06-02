import { checkController, endorseController } from './controller.js'
import { searchService } from '../search/service.js'
import { config } from '#/config/config.js'

const service = searchService(config.get("pegasusBaseUrl"), fetch);

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
          path: '/check-permit-details',
          ...checkController(service)
        },
        {
          method: 'POST',
          path: '/permit/{permitNumber}/endorse',
          ...endorseController(service)
        }
      ])
    }
  }
}
