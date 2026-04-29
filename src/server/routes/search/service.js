export const searchService = {
    lookupOne: (permitNumber, authHeader) => {
        return fetch('https://org99791a21.api.crm11.dynamics.com/api/data/v9.2/cites_SearchPermitByNumber', {
            method: 'POST',
            headers: {
                "Authorization": authHeader,
                "Accept": "application/json",
                "Content-Type": "application/json",
                "OData-MaxVersion": "4.0",
                "OData-Version": "4.0"
            },
            body: JSON.stringify({"permitNumber": permitNumber}),
        });
    }
}