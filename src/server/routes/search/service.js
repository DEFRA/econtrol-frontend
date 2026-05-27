/**
 * @typedef {Object} PermitDetails
 * @property {string} permitId
 * @property {number} deadOnArrival
 * @property {string} mrnReference
 * @property {Date} tradeDate
 * @property {string} port
 */

/**
* @param {string} authHeader
* @param {function} fetch;
*/
export const searchService = (authHeader, fetch) => ({
  /**
  * @param {string} permitNumber
  */
  async lookupOne(permitNumber) {
    return fetch('https://org99791a21.api.crm11.dynamics.com/api/data/v9.2/cites_SearchPermitByNumber', {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${authHeader}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0"
      },
      body: JSON.stringify({ "permitNumber": permitNumber })
    });
  },

  /**
  * @param {Array<string>} permitNumbers
  * @returns {Promise<Object<string, PermitDetails>>}
  */
  async lookupMany(permitNumbers) {
    const uniquePermitNumbers = [...new Set(permitNumbers)];
    const entries = await Promise.all(
      uniquePermitNumbers.map(async (pn) => [pn, await this.lookupOne(pn)])
    );
    return Object.fromEntries(entries);
  },

  /**
  * @param {string} permitId
  * @param {PermitDetails} permitDetails
  */
  async endorseOne(permitId, permitDetails) {
    return fetch('https://org99791a21.api.crm11.dynamics.com/api/data/v9.2/cites_EndorsePermit', {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${authHeader}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0"
      },
      body: JSON.stringify({
        "permitId": permitId,
        "cites_NumberofanimalsDOA": permitDetails.deadOnArrival,
        "cites_MovementReferenceNumberMRN": permitDetails.mrnReference,
        "cites_tradedate": permitDetails.tradeDate.toISOString().split('T')[0],
        //"cites_CustomsOfficerEpauletteNumber": "TEST_OFFICE_EPAULETTE",
        "cites_Port": permitDetails.port
      })
    })
  }
});
