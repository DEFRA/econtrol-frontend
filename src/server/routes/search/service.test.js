import { searchService } from './service.js';
import { describe, test, expect, vi } from 'vitest';

describe('searchService', () => {
  let service
  let mockFetch

  beforeAll(async () => {
    mockFetch = vi.fn()
    service = searchService("TEST_AUTH_TOKEN", mockFetch)
  })

  afterAll(async () => {
  })

  describe('endorseOne', () => {
    test('calls fetch', async () => {
      await service.endorseOne("TEST_PERMIT_ID", {
        deadOnArrival: 2,
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
    //test('maps the statuses correctly', () => {
    //  mockFetch = vi.fn(async () => ({}));
    //});
  })

  describe('lookupMany', async () => {
    test('calls fetch once per unique permit number', async () => {
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
