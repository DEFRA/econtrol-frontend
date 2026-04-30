import { config } from '#/config/config.js'

const proxy = config.get('httpProxy')

export const searchService = (authHeader) => ({
    lookupOne(permitNumber) {
        return fetch('https://org99791a21.api.crm11.dynamics.com/api/data/v9.2/cites_SearchPermitByNumber', {
            method: 'POST',
            headers: {
                "Authorization": authHeader,
                "Accept": "application/json",
                "Content-Type": "application/json",
                "OData-MaxVersion": "4.0",
                "OData-Version": "4.0"
            },
            body: JSON.stringify({"permitNumber": permitNumber})
        });
    },
    async lookupMany(permitNumbers) {
       const rs = permitNumbers.map((pn) => ({ [pn]: this.lookupOne(pn) }));
       const obj = rs.reduce((acc, cur) => ({ ...acc, ...cur }), {});
       return Promise.all(
           Object.entries(obj).map(async ([k, v]) => [k, await v])
       ).then(Object.fromEntries);
    }
})

export function isValidPermitNumber(permitNumber) {
    return RegExp("^[0-9]{2}GB(IMP|EXP)[A-Z0-9]{6}$").test(permitNumber)
}

export function isExportNotImport(validPermitNumber) {
    return validPermitNumber.slice(4,7) === "EXP"
}