import { isValidPermitNumber, isExportNotImport, formatDate } from '#/server/common/utils.js'
import _ from 'lodash'
import { PermitStatus, Unit } from './service.js'

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

/** @param {import('./service.js').Unit} unit
 *  @return string
 */
export const unitToText = (unit) => {
  const entry = Object.entries(Unit).find(([_, v]) => v === unit);
  return entry ? entry[0] : "";
}

/** @param {import('./service.js').Quantity | import('./service.js').NetMass} amount
 *  @return string
 */
const amountToText = (amount) => {
  if ('unit' in amount) {
    const unitText = unitToText(amount.unit);
    return `${amount.mass}${unitText}`
  } else {
    return amount.quantity.toString()
  }
}

/**
 * @param {typeof PermitStatus[keyof typeof PermitStatus]} statusLabel
 * @returns {'red' | 'green' | 'blue'}
 */
export const statusLabelColour = (statusLabel) => {
  switch (statusLabel) {
    case "Valid":
      return "blue"
    case "Endorsed":
      return "green"
    default:
      return "red"
  }
}


/**
 * @param {import('./service').SearchService} searchService
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

    if (valid.length === 0) {
      return h.view('search/index', {
        pageTitle: 'Search for CITES permits',
        heading: 'Search',
        error: true
      })
    }


    const permits = await searchService.lookupMany(token, valid);

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
        gbAnnex: permit.gbAnnex,
        quantity: amountToText(permit.amount)
      };
    }));

    const errors = [...Object.entries(permits).filter(([_, v]) => !v.ok).map(([k, _]) => k), ...invalid];

    request.yar.set('permit_results', results);

    return h.view('search/results', {
      pageTitle: 'Permit search results',
      heading: 'Results',
      results,
      errors,
    })
  }
})
