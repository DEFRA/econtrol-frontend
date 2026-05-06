import { searchService } from './service.js';
import { describe, test, expect, vi } from 'vitest';

describe('searchService', () => {
  let service
  let mockFetch

  beforeAll(async () => {
    mockFetch = vi.fn()
    service = searchService("TEST_AUTH_HEADER", mockFetch)
  })

  afterAll(async () => {
  })

  describe('lookupOne', () => {
    test('calls fetch', async () => {
      await service.lookupOne("TEST_PERMIT_NUMBER")
      expect(mockFetch).toHaveBeenCalledExactlyOnceWith(
        'https://org99791a21.api.crm11.dynamics.com/api/data/v9.2/cites_SearchPermitByNumber', {
        method: 'POST',
        headers: {
          "Authorization": "TEST_AUTH_HEADER",
          "Accept": "application/json",
          "Content-Type": "application/json",
          "OData-MaxVersion": "4.0",
          "OData-Version": "4.0"
        },
        body: JSON.stringify({ "permitNumber": "TEST_PERMIT_NUMBER" })
      });
    })
  })

  describe('lookupMany', async () => {
    test('calls fetch once per unique permit number', async () => {
      await service.lookupMany(["TEST1", "TEST2", "TEST1"])
      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://org99791a21.api.crm11.dynamics.com/api/data/v9.2/cites_SearchPermitByNumber', {
        method: 'POST',
        headers: {
          "Authorization": "TEST_AUTH_HEADER",
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
          "Authorization": "TEST_AUTH_HEADER",
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
