import { loginPageController, callbackController } from './controller.js'

export const auth = {
  plugin: {
    name: 'auth',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/auth/login',
          ...loginPageController,
          options: {
            auth: false,
          }
        }
      ])
      server.route([
        {
          method: 'POST',
          path: '/auth/callback',
          ...callbackController,
          options: {
            auth: false,
          }
        }
      ])
      // Register POST route at / for localhost callback
      // This should be changed at some point...
      server.route([
        {
          method: 'POST',
          path: '/',
          ...callbackController,
          options: {
            auth: false,
          }
        }
      ])
    }
  }
}
