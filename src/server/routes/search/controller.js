import { isValidPermitNumber, isExportNotImport, mapStatusLabel, formatDate } from '#/server/common/utils.js'
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
  async handler(request, h) {
    const payload = request.payload["permitReferences"] || "";

    const token = request.auth.credentials.token

    const references = payload
      .split('\n')
      .map(s => s.trim())
      .filter(isValidPermitNumber);

    const permitResponses = await searchService(token, fetch).lookupMany(references);

    console.log(permitResponses)

    const results = await Promise.all(Object.values(permitResponses).filter((v) => v.ok).map(async (r) => {
      const json = await r.json();
      console.log(json)
      return {
        ...json,
        statusLabel: mapStatusLabel(json.statusLabel),
        validityDate: formatDate(new Date(json.validityDate)),
        isExportNotImport: isExportNotImport(json.permitNumber)
      };
    }));

    const errors = Object.entries(permitResponses).filter(([k, v]) => !v.ok).map(([k, v]) => k);

    console.log(results);
    console.log(errors);

    return h.view('search/results', {
      pageTitle: 'Results',
      heading: 'Results',
      results,
      errors
    });
  }
}
