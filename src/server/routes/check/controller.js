import Boom from '@hapi/boom'
import { isValidPermitNumber, isExportNotImport, formatDate } from '#/server/common/utils.js';

/**
* @param {import('../search/service').SearchServiceFactory} searchService
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

    const response = await searchService(token, fetch).lookupOne(permitNumber);
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
          statusLabel: permit.status,
          validityDate: formatDate(new Date(permit.validityDate)),
          isExportNotImport: isExportNotImport(permit.permitNumber)
        }
      });
    } else {
      console.log(request)
      switch (response.status) {
        case 401: {
          console.log("401 received from Pegasus")
          //return h.redirect("/auth/login")
        }
      }
    }
  }
})

/**
* @param {import('../search/service').SearchServiceFactory} searchService
*/
export const endorseController = (searchService) => ({
  /**
   * @param {import('@hapi/hapi').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
  async handler(request, h) {
    const token = request.auth.credentials.token

    const permitNumber = request.params.permitNumber;

    if (!isValidPermitNumber(permitNumber)) {
      throw Boom.badRequest("Invalid permit number");
    }

    const update = {
      //...request.payload,
      //tradeDate: new Date()
    }

    const response = await searchService(token, fetch).endorseOne(request.payload.permitId, update);
    console.log(`PEGASUS ENDORSE RES: ${JSON.stringify(response)}`)

    if (response.ok) {
      return h.redirect(`/permit/${permitNumber}/check`);
    } else {
      var error = new Error('Unexpected error');
      throw Boom.boomify(error, { statusCode: response.status });
    }
  }
})
