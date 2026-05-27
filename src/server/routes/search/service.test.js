import { PermitStatus, searchService } from './service.js';
import { describe, test, expect, vi, afterAll, beforeAll, assert } from 'vitest';

/** @typedef {import('./service.js').SearchService} SearchService */

describe('searchService', () => {
  /** @type SearchService */
  let service
  let mockFetch = vi.fn();

  beforeAll(async () => {
    vi.useFakeTimers()
    service = searchService("TEST_AUTH_TOKEN", mockFetch)
  })

  afterAll(async () => {
    vi.useRealTimers()
  })

  describe('endorseOne', () => {
    test('calls fetch', async () => {
      mockFetch.mockReturnValueOnce({
        ok: true,
        json: async () => ({
          validityDate: new Date("2026-05-31")
        })
      });
      await service.endorseOne({
        permitId: "TEST_PERMIT_ID",
        numberOfAnimalsDOA: 2,
        mrnReference: "TEST_MRN_NUMBER",
        //officerEpauletteNumber: "TEST_OFFICE_EPAULETTE",
        tradeDate: new Date("2026-05-10"),
        port: "TEST_PORT"
      })
      expect(mockFetch).toHaveBeenCalledExactlyOnceWith(
        'https://org99791a21.api.crm11.dynamics.com/api/data/v9.2/cites_EndorsePermit', {
        method: 'POST',
        headers: {
          "Authorization": "Bearer TEST_AUTH_TOKEN",
          "Accept": "application/json",
          "Content-Type": "application/json",
          "OData-MaxVersion": "4.0",
          "OData-Version": "4.0"
        },
        body: JSON.stringify({
          "permitId": "TEST_PERMIT_ID",
          //"cites_quantityreturned": 10.5,
          //"cites_netmassreturned": 25.2,
          //"cites_unitreturned": 149900001,
          "cites_NumberofanimalsDOA": 2,
          "cites_MovementReferenceNumberMRN": "TEST_MRN_NUMBER",
          "cites_tradedate": "2026-05-10",
          //"cites_CustomsOfficerEpauletteNumber": "TEST_OFFICE_EPAULETTE",
          "cites_Port": "TEST_PORT"
        })
      });
    })
  })

  describe('lookupOne', () => {
    test('calls fetch', async () => {
      mockFetch.mockReturnValueOnce({
        ok: true,
        json: async () => ({
          validityDate: new Date("2026-05-31")
        })
      });
      await service.lookupOne("TEST_PERMIT_NUMBER")
      expect(mockFetch).toHaveBeenCalledExactlyOnceWith(
        'https://org99791a21.api.crm11.dynamics.com/api/data/v9.2/cites_SearchPermitByNumber', {
        method: 'POST',
        headers: {
          "Authorization": "Bearer TEST_AUTH_TOKEN",
          "Accept": "application/json",
          "Content-Type": "application/json",
          "OData-MaxVersion": "4.0",
          "OData-Version": "4.0"
        },
        body: JSON.stringify({ "permitNumber": "TEST_PERMIT_NUMBER" })
      });
    })

    test.each`
      pegasusStatus           | expectedLabel             | currentDate     | expiryDate
      ${'Issued'}             | ${PermitStatus.VALID}     | ${"2026-05-30"} | ${"2026-05-31"}
      ${'Issued'}             | ${PermitStatus.EXPIRED}   | ${"2026-05-31"} | ${"2026-05-31"}
      ${'Returned - Used'}    | ${PermitStatus.ENDORSED}  | ${"2026-05-30"} | ${"2026-05-31"}
      ${'Returned - Used'}    | ${PermitStatus.ENDORSED}  | ${"2026-06-01"} | ${"2026-05-31"}
      ${'Returned - Unused'}  | ${PermitStatus.NOT_VALID} | ${"2026-05-30"} | ${"2026-05-31"}
    `('maps permit status $pegasusStatus to $expectedLabel when date is $currentDate and expiry is $expiryDate',
      async ({ pegasusStatus, expectedLabel, currentDate, expiryDate }) => {
        vi.setSystemTime(new Date(currentDate))
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            statusLabel: pegasusStatus,
            validityDate: expiryDate
          })
        });
        const result = await service.lookupOne("TEST_PERMIT_NUMBER");
        if (result.ok) {
          expect(result.value.status).toEqual(expectedLabel)
        } else {
          expect.fail("Did not return successful result")
        }
      });

    test('draft permits are treated as a lookup error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          statusLabel: "Draft"
        })
      });
      const result = await service.lookupOne("TEST_PERMIT_NUMBER");
      if (!result.ok) {
        expect(result.error).toEqual("Draft");
      } else {
        expect.fail("Expected unsuccessful result")
      }

    })
  })

  describe('lookupMany', async () => {
    test('calls fetch once per unique permit number', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          statusLabel: "Issued"
        })
      });
      await service.lookupMany(["TEST1", "TEST2", "TEST1"])
      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://org99791a21.api.crm11.dynamics.com/api/data/v9.2/cites_SearchPermitByNumber', {
        method: 'POST',
        headers: {
          "Authorization": "Bearer TEST_AUTH_TOKEN",
          "Accept": "application/json",
          "Content-Type": "application/json",
          "OData-MaxVersion": "4.0",
          "OData-Version": "4.0"
        },
        body: JSON.stringify({ "permitNumber": "TEST2" })
      });
      expect(mockFetch).toHaveBeenCalledWith(
        'https://org99791a21.api.crm11.dynamics.com/api/data/v9.2/cites_SearchPermitByNumber', {
        method: 'POST',
        headers: {
          "Authorization": "Bearer TEST_AUTH_TOKEN",
          "Accept": "application/json",
          "Content-Type": "application/json",
          "OData-MaxVersion": "4.0",
          "OData-Version": "4.0"
        },
        body: JSON.stringify({ "permitNumber": "TEST2" })
      });
    })
  })
})
