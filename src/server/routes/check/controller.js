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

    if (response.ok) {
      const permit = response.value;

      let nav = null;
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
          gbAnnex: permit.gbAnnex,
          amount: {
            ...permit.amount,
            unitText: ('unit' in permit.amount) ? unitToText(permit.amount.unit) : undefined,
            unitTextLong: ('unit' in permit.amount) ? unitToTextLong[unitToText(permit.amount.unit)] : undefined,
          },
          mrn
        }
      });
    } else {
      if (response.error === "Draft") {
        throw Boom.boomify(new Error("Draft"), { statusCode: 404 });
      }
      console.log(request)
      switch (response.error.status) {
        case 401: {
          console.log("401 received from Pegasus")
          //return h.redirect("/auth/login")
        }
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

    console.log(`MRN: ${mrn}`)
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

    const endorsement = {
      ...payload,
      cites_unitreturned: QUANTITY
      //tradeDate: new Date()
    }

    const response = await searchService.endorseOne(token, endorsement);
    console.log(`PEGASUS ENDORSE RES: ${JSON.stringify(response)}`)

    if (response.ok) {
      return h.redirect(`/check-permit-details?permitNumber=${permitNumber}`);
    } else {
      var error = new Error('Unexpected error');
      throw Boom.boomify(error, { statusCode: response.error.status });
    }
  }
})
