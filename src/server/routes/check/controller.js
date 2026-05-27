import Boom from '@hapi/boom'
import { mapStatusLabel, isValidPermitNumber, isExportNotImport, formatDate } from '#/server/common/utils.js';

export const checkController = (searchService) => ({
  async handler(request, h) {

    const token = request.auth.credentials.token

    const permitNumber = request.query.permitNumber;

    if (!isValidPermitNumber(permitNumber)) {
      throw Boom.badRequest("Invalid permit number");
    }

    const response = await searchService(token, fetch).lookupOne(permitNumber);
    if (response.ok) {
      const result = await response.json();

      console.log(result);

      return h.view('check/index', {
        pageTitle: 'Check permit details',
        heading: 'Check',
        permit: {
          ...result,
          statusLabel: mapStatusLabel(result.statusLabel),
          validityDate: formatDate(new Date(result.validityDate)),
          isExportNotImport: isExportNotImport(result.permitNumber)
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

export const endorseController = (searchService) => ({
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

    console.log(`permitId: ${request.payload.permitId}`)

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
