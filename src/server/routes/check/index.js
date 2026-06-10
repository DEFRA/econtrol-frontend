import { checkController, endorseController, setMrnController } from './controller.js'
import { searchService } from '../search/service.js'
import { config } from '#/config/config.js'

const fetchTrace = async (resource, options = {}) => {
  // 1. Only intercept if a body is present
  if (options.body) {
    try {
      // 2. Instantiate a standard Request object to trigger internal runtime serialization
      const inspector = new Request(resource, options);

      // 3. Clone the request object so the stream is not locked ("disturbed")
      const rawBodyText = await inspector.clone().text();

      console.log('=== RAW REQUEST BODY (PRE-TLS) ===');
      console.log(rawBodyText);
      console.log('==================================');
    } catch (err) {
      console.warn('⚠️ Unable to parse raw body payload:', err);
    }
  }

  // 4. Pass control back to the original fetch call
  return fetch(resource, options);
};

const service = searchService(config.get("pegasusBaseUrl"), fetchTrace);

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
          path: '/set-mrn',
          ...setMrnController()
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
