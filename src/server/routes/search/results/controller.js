export const searchResultsController = {
  handler(_request, h) {
    return h.view('search/index', {
      pageTitle: 'Search Results',
      heading: 'Search Results'
    })
  }
}