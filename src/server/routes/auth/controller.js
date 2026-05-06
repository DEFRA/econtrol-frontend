
export const loginController = {
  handler(_request, h) {
    return h.view('auth/login', {
      pageTitle: 'Auth',
      heading: 'Auth'
    })
  }
}

export const callbackController = {
   async handler(request, h) {
  }
}
