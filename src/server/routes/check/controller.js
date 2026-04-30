import { searchService, isValidPermitNumber } from '../search/service.js'

export const checkController = {
  handler(_request, h) {
    return new Promise((resolve, reject) => {
      const authHeader = _request.headers["authorization"]
      const permitRef = _request.query["permit"]
      if (!isValidPermitNumber(permitRef)) {
        reject("Error: invalid permit number")
      }
      searchService(authHeader).lookupOne(permitRef).then(
        (r) => r.json().then((result) => {
          console.log(result)
          resolve(h.view('check/index', {
            pageTitle: 'Check',
            heading: 'Check',
            permit: result
          }))
        })
      )
    })
  }
}
