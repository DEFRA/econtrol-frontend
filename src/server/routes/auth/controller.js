import { config } from '#/config/config.js'

const oauthConfig = config.get('oauth');

export const loginPageController = {
  handler(_request, h) {
    console.log("Login Page")
    return h.view('auth/login', {
      pageTitle: 'Auth',
      heading: 'Auth',
      clientId: oauthConfig.clientId,
      redirectUri: oauthConfig.redirectUri
    })
  }
}

export const callbackController = {
  async handler(request, h) {
    if (request.payload.access_token) {
      console.log("Callback: " + JSON.stringify(request.payload))

      return h.redirect(`/`).state('econtrol-auth', request.payload.access_token, {
        // This should probably be changed in production...
        // It's only to get around the cross-site POST to GET cookie set issue
        path: '/',
        isSameSite: 'Lax',
        isSecure: true,
        encoding: 'none'
      })
    }
  }
}
