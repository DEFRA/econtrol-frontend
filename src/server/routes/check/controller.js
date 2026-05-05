import Boom from '@hapi/boom'
import { searchService } from '../search/service.js'
import { mapStatusLabel, isValidPermitNumber, isExportNotImport, formatDate } from '#/server/common/utils.js';

export const checkController = {
  async handler(request, h) {
    const authHeader = request.headers["authorization"];
    const permitRef = request.query["permit"];

    if (!isValidPermitNumber(permitRef)) {
      throw Boom.badRequest("Invalid permit number");
    }

    try {
      const response = await searchService(authHeader, fetch).lookupOne(permitRef);
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
    } catch (err) {
      console.error(err);
      throw Boom.internal("Failed to retrieve permit data");
    }
  }
}
