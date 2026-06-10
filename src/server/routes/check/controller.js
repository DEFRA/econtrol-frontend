import Boom from '@hapi/boom'
import { isValidPermitNumber, isExportNotImport, formatDate } from '#/server/common/utils.js';
import { QUANTITY, Unit } from '../search/service.js';
import { statusLabelColour, unitToText } from '../search/controller.js';

/** @type {Record<keyof typeof Unit, string>} */
const unitToTextLong = Object.freeze({
  g: "grams",
  kg: "kilograms",
  l: "liters",
  cm3: "cubic centimeters",
  ml: "millilitres",
  m: "meters",
  m2: "square meters",
  m3: "cubic meters",
  tonne: "tonnes"
})

/**
* @param {import('../search/service').SearchService} searchService
*/
export const checkController = (searchService) => ({
  /**
   * @param {import('@hapi/hapi').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
  async handler(request, h) {

    /** @type {string} */
    const token = (/** @type (any)*/ (request.auth.credentials.token))

    /** @type {string} */
    const permitNumber = (/** @type (any)*/ (request.query.permitNumber));

    if (!isValidPermitNumber(permitNumber)) {
      throw Boom.badRequest("Invalid permit number");
    }

    const response = await searchService.lookupOne(token, permitNumber);

    const messages = request.yar.flash();

    if (response.ok) {
      const permit = response.value;

      let nav;
      const permitSet = request.yar.get("permit_results");

      if (Array.isArray(permitSet) && permitSet.length > 1) {
        const idx = permitSet.findIndex(i => i.permitNumber === permitNumber);
        if (idx !== -1) {
          nav = {
            curr: idx + 1,
            last: permitSet.length,
            prev: idx > 0 ? permitSet[idx - 1].permitNumber : null,
            next: idx < permitSet.length - 1 ? permitSet[idx + 1].permitNumber : null
          }
        }
      }

      const mrn = request.yar.get("mrn") || "";

      return h.view('check/index', {
        pageTitle: 'Check permit details',
        heading: 'Check',
        nav,
        messages,
        permit: {
          permitId: permit.permitId,
          permitNumber: permit.permitNumber,
          scientificName: permit.scientificName,
          commonName: permit.commonName,
          statusLabel: permit.status,
          statusLabelColour: statusLabelColour(permit.status),
          validityDate: formatDate(new Date(permit.validityDate)),
          isExportNotImport: isExportNotImport(permit.permitNumber),
          exporterName: permit.exporterName,
          exporterAddress: permit.exporterAddress?.split(',').map(s => s.trim()).join('\n'),
          importerName: permit.importerName,
          importerAddress: permit.importerAddress?.replace(",", "\n"),
          citesAppendix: permit.citesAppendix,
          countryOfOrigin: permit.countryOfOrigin,
          countryOfExport: permit.countryOfExport,
          countryOfImport: permit.countryOfImport,
          countryOfReExport: permit.countryOfReExport,
          countryOfLastReExport: permit.countryOfLastReExport,
          gbAnnex: permit.gbAnnex,
          purposeCode: permit.purposeCode,
          sourceCode: permit.sourceCode,
          amount: {
            ...permit.amount,
            unitText: ('unit' in permit.amount) ? unitToText(permit.amount.unit) : undefined,
            unitTextLong: ('unit' in permit.amount) ? unitToTextLong[unitToText(permit.amount.unit)] : undefined,
          },
          specialConditions: permit.specialConditions,
          specimenDescription: permit.specimenDescription,
          mrn
        }
      });
    } else {
      if (response.error === "Draft") {
        throw Boom.boomify(new Error("Draft"), { statusCode: 404 });
      }
    }
  }
})

export const setMrnController = () => ({
  /**
   * @param {import('@hapi/hapi').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
  async handler(request, h) {
    /** @type {Object} */
    const { mrn } = (/** @type (any)*/ (request.payload));

    request.yar.set("mrn", mrn);

    return h.response('OK').code(200);
  }
})

/**
* @param {import('../search/service').SearchService} searchService
*/
export const endorseController = (searchService) => ({
  /**
   * @param {import('@hapi/hapi').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
  async handler(request, h) {
    /** @type {string} */
    const token = (/** @type (any)*/ (request.auth.credentials.token))

    /** @type {string} */
    const permitNumber = (/** @type (any)*/ (request.params.permitNumber));

    /** @type {import('../search/service').EndorsePermit} */
    const payload = (/** @type (any)*/ (request.payload));

    if (!isValidPermitNumber(permitNumber)) {
      throw Boom.badRequest("Invalid permit number");
    }

    /** @type {import('../search/service').EndorsePermit} */
    const endorsement = {
      permitId: payload.permitId,
      actualQuantity: Number(payload.actualQuantity),
      numberOfAnimalsDOA: Number(payload.numberOfAnimalsDOA),
      mrnReference: payload.mrnReference,
      customersOfficerId: "NOT_IMPLEMENTED",
      port: "NOT_IMPLEMENTED"
    }

    const response = await searchService.endorseOne(token, endorsement);

    if (response.ok) {
      request.yar.flash("endorse_success", "The permit has been successfully endorsed.");
      return h.redirect(`/check-permit-details?permitNumber=${permitNumber}`);
    } else {
      const error = new Error('Unexpected error');
      throw Boom.boomify(error, { statusCode: response.error.status });
    }
  }
})
