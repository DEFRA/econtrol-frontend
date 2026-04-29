import { searchService } from '../search/service.js'

export const checkController = {
  handler(_request, h) {
    return new Promise((resolve, reject) => {
      const authHeader = _request.headers["authorization"]
      searchService.lookupOne("24GBEXP1CLWMD", authHeader).then(
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