import { isValidPermitNumber, isExportNotImport, formatDate } from '#/server/common/utils.js'
import _ from 'lodash'
import { PermitStatus } from './service.js'

export const searchController = {
  /**
   * @param {import('@hapi/hapi').Request} _request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   * @returns {import('@hapi/hapi').ResponseObject}
   */
  handler(_request, h) {
    return h.view('search/index', {
      pageTitle: 'Search for CITES permits',
      heading: 'Search'
    })
  }
}

/**
 * @param {import('./service').SearchServiceFactory} searchService
 */
export const resultsController = (searchService) => ({
  /**
   * @param {import('@hapi/hapi').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
  async handler(request, h) {
    /** @type {string} */
    const token = (/** @type (any)*/ (request.auth.credentials.token))

    /** @type {string} */
    const payload = (/** @type (any) */ (request.payload)["permitReferences"]) || "";

    const [valid, invalid] = _.partition(
      payload.split('\n').map(s => s.trim()).filter(
        /**@type{string}*/ i => i !== ""
      ), isValidPermitNumber
    );

    const permits = await searchService(token, fetch).lookupMany(valid);

    /**
     * @param {typeof PermitStatus[keyof typeof PermitStatus]} statusLabel
     * @returns {'red' | 'green' | 'blue'}
     */
    const statusLabelColour = (statusLabel) => {
      switch (statusLabel) {
        case "Valid":
          return "blue"
        case "Endorsed":
          return "green"
        default:
          return "red"
      }
    }

    const results = await Promise.all(Object.values(permits).filter((v) => v.ok).map(async (r) => {
      const permit = r.value;
      return {
        permitId: permit.permitId,
        permitNumber: permit.permitNumber,
        isExportNotImport: isExportNotImport(permit.permitNumber),
        validityDate: formatDate(new Date(permit.validityDate)),
        statusLabel: permit.status,
        statusLabelColour: statusLabelColour(permit.status),
        scientificName: permit.scientificName,
        citesAppendix: permit.citesAppendix,
        gbAnnex: permit.gbAnnex
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
