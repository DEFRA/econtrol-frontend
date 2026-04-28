export const searchController = {
  handler(_request, h) {
    return h.view('search/index', {
      pageTitle: 'Search',
      heading: 'Search'
    })
  }
}
