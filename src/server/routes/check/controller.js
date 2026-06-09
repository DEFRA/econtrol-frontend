import Boom from '@hapi/boom'
import { isValidPermitNumber, isExportNotImport, formatDate } from '#/server/common/utils.js';
import { Unit } from '../search/service.js';
import { statusLabelColour } from '../search/controller.js';

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

      console.log(permit);

      return h.view('check/index', {
        pageTitle: 'Check permit details',
        heading: 'Check',
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
          gbAnnex: permit.gbAnnex,
          quantity: !('unit' in permit.amount) ? permit.amount.quantity : undefined,
          netMass: ('unit' in permit.amount) ? permit.amount.mass : undefined
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
      cites_unitreturned: Unit.quantity
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
