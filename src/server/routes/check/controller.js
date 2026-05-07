import Boom from '@hapi/boom'
import { searchService } from '../search/service.js'
import { mapStatusLabel, isValidPermitNumber, isExportNotImport, formatDate } from '#/server/common/utils.js';

export const checkController = {
  async handler(request, h) {
    const permitRef = request.query["permit"];

    const token = request.auth.credentials.token

    if (!isValidPermitNumber(permitRef)) {
      throw Boom.badRequest("Invalid permit number");
    }

    const response = await searchService(token, fetch).lookupOne(permitRef);
    if (response.ok) {
      const result = await response.json();

      console.log(result);

      return h.view('check/index', {
        pageTitle: 'Check',
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
}
