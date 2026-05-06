
import { loginController, callbackController } from './controller.js'

export const auth = {
  plugin: {
    name: 'auth',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/auth/login',
          ...loginController
        }
      ])
      server.route([
        {
          method: 'GET',
          path: '/auth/callback',
          ...callbackController
        }
      ])
    }
  }
}
