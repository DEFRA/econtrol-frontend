import { searchService } from './service.js'

export const searchController = {
  handler(_request, h) {
    return h.view('search/index', {
      pageTitle: 'Search',
      heading: 'Search'
    })
  }
}

export const resultsController = {
  handler(_request, h) {
    return new Promise((resolve, reject) => {
      const authHeader = _request.headers["authorization"]
      searchService.lookupOne("24GBEXP1CLWMD", authHeader).then(
        (r) => r.json().then((result) => {
          console.log(result)
          resolve(h.view('search/results/index', {
            pageTitle: 'Results',
            heading: 'Results',
            results: [result]
          }))
        })
      )
    })
  }
}