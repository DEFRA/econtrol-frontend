export function buildNavigation(request) {
  return [
    {
      text: 'Search',
      href: '/',
      current: request?.path === '/'
    },
  ]
}
