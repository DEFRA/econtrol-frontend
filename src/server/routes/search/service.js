// @ts-check
import Ajv from "ajv";

/**
 * Search service factory
 * @callback SearchServiceFactory
 * @param {string} baseURL
 * @param {(input: string, init?: Object) => Promise<any>} fetch
 * @returns {SearchService}
 */

/**
 * HTTP Error
 * @typedef {Object} HttpError
 * @property {number} status
 */

/**
 * Bad Permit. Currently Draft permits are deemed "bad" and we'd like to treat
 * it like a lookup error.
 * @typedef {"Draft"} BadPermit
 */

/**
 * Error while looking up a permit. Either HTTP status code or service-level
 * error because the data returned does not meet certain critera.
 * @typedef {HttpError | BadPermit} PermitLookupError
 */

/**
 * An instance of search service closed over API key and fetch implementation
 * @typedef {Object} SearchService
 * @property {(authHeader: string, permitNumber: string) => Promise<Either<PermitLookupError, PermitDetails>>} lookupOne
 * @property {(authHeader: string, permitNumbers: Array<string>) => Promise<Record<string, Either<PermitLookupError, PermitDetails>>>} lookupMany
 * @property {(authHeader: string, endorsePermit: EndorsePermit) => Promise<Either<HttpError, PermitDetails>>}  endorseOne
 */

/**
* Represents a failed service operation (Left).
* @template E
* @typedef {Object} LeftFailure
* @property {false} ok
* @property {E} error
*/

/**
 * Represents a successful service operation (Right).
 * @template T
 * @typedef {Object} RightSuccess
 * @property {true} ok
 * @property {T} value
 */

/**
 * A functional Either wrapper union for clean error handling.
 * @template E, T
 * @typedef {LeftFailure<E> | RightSuccess<T>} Either
 */


/**
 * Permit details as represented by Pegasus
 * @typedef {Object} PermitDetailsDTO
 * @property {string} permitId "b352df39-3639-ef11-a316-000d3ad59b50"
 * @property {string} permitNumber "24GBEXPE5Y9KC"
 * @property {number} statuscode 149900002
 * @property {string} statusLabel "Returned - Used"
 * @property {string} validityDate "2025-01-03"
 * @property {number} netMass 0,
 * @property {number} quantity  20
 * @property {string} citesAppendix "II"
 * @property {string} originPermitNumber
 * @property {string} permitType
 * @property {string | null} commonNameOfSpecies null
 * @property {string | null} country
 * @property {string | null} countryOfExport null
 * @property {string | null} countryOfImport null
 * @property {string | null} countryOfLastReExport hull
 * @property {string | null} countryOfReExport null
 * @property {string | null} describeSpecimen
 * @property {string | null} exporterAddress "1, BURNS CLOSE, KIDDERMINSTER, WYRE FOREST, DY10 3ET, United Kingdom"
 * @property {string | null} exporterName null,
 * @property {string | null} gbAnnex "B"
 * @property {string | null} importerAddress 1, BURNS CLOSE, KIDDERMINSTER, WYRE FOREST, DY10 3ET, United Kingdom
 * @property {string | null} importerName "Rob Wilkinson DEV"
 * @property {string | null} purposeCode "E - Educational"
 * @property {string | null} scientificName
 * @property {string | null} sourceCode null
 * @property {string | null} specialConditions null
 */

/**
 * Permit details as represented within this service
 * @typedef {Object} PermitDetails
 * @property {string} permitId
 * @property {string} permitNumber
 * @property {typeof PermitStatus[keyof typeof PermitStatus]} status
 * @property {Date} validityDate
 * @property {string | null} scientificName
 * @property {string | null} commonName null
 * @property {string | null} exporterName null,
 * @property {string | null} exporterAddress "1, BURNS CLOSE, KIDDERMINSTER, WYRE FOREST, DY10 3ET, United Kingdom"
 * @property {string | null} importerName "Rob Wilkinson DEV"
 * @property {string | null} importerAddress 1, BURNS CLOSE, KIDDERMINSTER, WYRE FOREST, DY10 3ET, United Kingdom
 * @property {string} citesAppendix "II"
 * @property {string | null} gbAnnex "B"
 */

/**
 * Permit endorsement as represented within this service
 * @typedef {Object} EndorsePermit
 * @property {string} permitId
 * @property {number} actualQuantity
 * @property {number} numberOfAnimalsDOA
 * @property {string} mrnReference
 * @property {string} port
 */

/**@type import("ajv").Schema */
const schema = {
  type: "object",
  properties: {
    permtiId: { type: "string" },
    cites_NumberofanimalsDOA: { type: "number" },
    cites_MovementReferenceNumberMRN: { type: "string" },
    cites_tradedate: { type: "string" },
    cites_Port: { type: "string" },
  },
  required: ["permitId"],
  additionalProperties: false
}

export const Unit = Object.freeze({
  g: 149900000,
  kg: 149900001,
  l: 149900002,
  cm3: 149900003,
  ml: 149900004,
  m: 149900005,
  m2: 149900006,
  m3: 149900007,
  tonne: 149900010
})

export const QUANTITY = 149900009

/**
 * Permit details as represented by Pegasus Endorse API
 * Most of the fields are optional but we will permitDetails
 * all for completeness.
 * @typedef {Object} EndorsePermitDTO
 * @property {string}                                     permitId
 * @property {typeof Unit[keyof typeof Unit] | QUANTITY}  cites_unitreturned
 * @property {number=}                                    cites_quantityreturned
 * @property {number=}                                    cites_netmassreturned
 * @property {number=}                                    cites_NumberofanimalsDOA
 * @property {string=}                                    cites_MovementReferenceNumberMRN
 * @property {string=}                                    cites_tradedate
 * @property {string=}                                    cites_Port
 */

/**
 * @typedef {Object} QuantityDTO
 * @property {number}    cites_quantityreturned
 * @property {QUANTITY}  cites_unitreturned
 */

/**
 * @typedef {Object} NetMassDTO
 * @property {number}                         cites_netmassreturned
 * @property {typeof Unit[keyof typeof Unit]} cites_unitreturned
 *

/**
 * @typedef {QuantityDTO | NetMassDTO} QuantityOrNetMassDTO
 */

export const PermitStatus = Object.freeze({
  VALID: 'Valid',
  EXPIRED: 'Expired',
  ENDORSED: 'Endorsed',
  NOT_VALID: 'Not Valid',
  ERROR: 'Error'
});

/**
 * @param {Date} validityDate
 * @returns {typeof PermitStatus.VALID | typeof PermitStatus.EXPIRED}
 */
const validOrExpired = (validityDate) => {
  const now = new Date();
  return (+now < +validityDate) ? PermitStatus.VALID : PermitStatus.EXPIRED;
}

/**
 * @param {string} statusLabel
 * @param {Date} validityDate
 * @returns {typeof PermitStatus[keyof typeof PermitStatus]}
 */
const mapStatus = (statusLabel, validityDate) => {
  let status;
  switch (statusLabel) {
    case "Draft":
      status = PermitStatus.ERROR
      break;
    case "Issued":
      status = validOrExpired(validityDate)
      break;
    case "Returned - Used":
      status = PermitStatus.ENDORSED
      break;
    case "Returned - Unused":
      status = PermitStatus.NOT_VALID
      break;
    default:
      status = PermitStatus.ERROR;
      break;
  }
  return status;
}

/**
 * @param {PermitDetailsDTO} permitDetails
 * @returns {PermitDetails}
 */
const mapPermitDetails = (permitDetails) => {
  const validityDate = new Date(permitDetails.validityDate)
  return {
    ...permitDetails,
    validityDate,
    commonName: permitDetails.commonNameOfSpecies,
    status: mapStatus(permitDetails.statusLabel, validityDate)
  }
}

/**
* @type {SearchServiceFactory}
*/
export const searchService = (baseURL, fetch) => ({
  async lookupOne(authHeader, permitNumber) {
    const response = await fetch(`${baseURL}/api/data/v9.2/cites_SearchPermitByNumber`, {
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

    if (response.ok) {
      const permit = await response.json();
      console.log(`PERMIT: ${JSON.stringify(permit)}`)
      return (permit.statusLabel === "Draft") ?
        { ok: false, error: 'Draft' } :
        { ok: true, value: mapPermitDetails(permit) }
    } else {
      return {
        ok: false,
        error: {
          status: response.statuscode
        }
      }
    };
  },

  async lookupMany(authHeader, permitNumbers) {
    const uniquePermitNumbers = [...new Set(permitNumbers)];

    /** @type Array<[string, Either<PermitLookupError, PermitDetails>]> */
    const entries = await Promise.all(
      uniquePermitNumbers.map(async (pn) => [pn, await this.lookupOne(authHeader, pn)])
    );

    return Object.fromEntries(entries);
  },

  async endorseOne(authHeader, endorsement) {
    /** @type {EndorsePermitDTO | QuantityOrNetMassDTO} */
    const dto = {
      "permitId": endorsement.permitId,
      "cites_unitreturned": QUANTITY,
      "cites_NumberofanimalsDOA": endorsement.numberOfAnimalsDOA,
      "cites_MovementReferenceNumberMRN": endorsement.mrnReference,
      "cites_tradedate": new Date().toISOString().split('T')[0],
      "cites_Port": endorsement.port
    }
    const response = await fetch(`${baseURL}/api/data/v9.2/cites_EndorsePermit`, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${authHeader}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0"
      },
      body: JSON.stringify(dto)
    })

    return (response.ok) ? {
      ok: true,
      value: mapPermitDetails(await response.json())
    } : {
      ok: false,
      error: {
        status: response.status,
        message: response.statusText
      }
    };
  }
});
