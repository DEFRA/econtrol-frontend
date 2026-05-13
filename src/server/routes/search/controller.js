import { isValidPermitNumber, isExportNotImport, mapStatusLabel, formatDate } from '#/server/common/utils.js'
import _ from 'lodash'

export const searchController = {
  handler(_request, h) {
    return h.view('search/index', {
      pageTitle: 'Search for CITES permits',
      heading: 'Search'
    })
  }
}

export const resultsController = (searchService) => ({
  async handler(request, h) {
    // the middleware has already checked the token
    const token = request.auth.credentials.token

    const payload = request.payload["permitReferences"] || "";

    const [valid, invalid] = _.partition(
      payload.split('\n').map(s => s.trim()).filter(i => i !== ""),
      isValidPermitNumber
    );

    const permits = await searchService(token, fetch).lookupMany(valid);

    const results = await Promise.all(Object.values(permits).filter((v) => v.ok).map(async (r) => {
      const json = await r.json();
      return {
        ...json,
        statusLabel: mapStatusLabel(json.statusLabel),
        validityDate: formatDate(new Date(json.validityDate)),
        isExportNotImport: isExportNotImport(json.permitNumber)
      };
    }));

    const errors = [...Object.entries(permits).filter(([_, v]) => !v.ok).map(([k, _]) => k), ...invalid];

    return h.view('search/results', {
      pageTitle: 'Permit search results',
      heading: 'Results',
      results,
      errors,
    });
  }
})
