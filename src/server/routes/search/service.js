export const searchService = (authHeader, fetch) => ({
  lookupOne(permitNumber) {
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
  async lookupMany(permitNumbers) {
    const uniquePermitNumbers = [...new Set(permitNumbers)];
    const entries = await Promise.all(
      uniquePermitNumbers.map(async (pn) => [pn, await this.lookupOne(pn)])
    );
    return Object.fromEntries(entries);
  },
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
        //"cites_quantityreturned": 10.5,
        //"cites_netmassreturned": 25.2,
        //"cites_unitreturned": 149900001,
        "cites_NumberofanimalsDOA": permitDetails.animalsDoa,
        "cites_MovementReferenceNumberMRN": permitDetails.mrn,
        "cites_tradedate": permitDetails.tradeDate.toISOString().substring(0, 10),
        "cites_CustomsOfficerEpauletteNumber": permitDetails.officerEpauletteNumber,
        "cites_Port": permitDetails.port
      })
    })
  }
});
