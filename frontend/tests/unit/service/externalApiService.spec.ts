import { externalApiService } from '@/services';
import { getGeocoderNearestOccupant, searchGeocoderAddress, searchOrgBook } from '@/services/externalApiService';
import { geocoderAxios, orgBookAxios } from '@/services/interceptors';
import { ADDRESS_CODER_QUERY_PARAMS, ORG_BOOK_QUERY_PARAMS } from '@/utils/constants/housing';

vi.mock('@/services/interceptors', () => ({
  geocoderAxios: vi.fn(),
  orgBookAxios: vi.fn()
}));

describe('external api service', () => {
  const mockGeocoderGet = vi.fn();
  const mockOrgBookGet = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(geocoderAxios).mockReturnValue({
      get: mockGeocoderGet
    } as never);

    vi.mocked(orgBookAxios).mockReturnValue({
      get: mockOrgBookGet
    } as never);
  });

  describe('getGeocoderNearestOccupant', () => {
    it('returns nearest occupant data', async () => {
      const response = {
        occupantName: 'Acme Testing Services',
        siteID: 'fake-site-id'
      };

      mockGeocoderGet.mockResolvedValue({
        data: response
      });

      const result = await getGeocoderNearestOccupant({
        longitude: '12.3456',
        latitude: '-78.9012'
      });

      expect(mockGeocoderGet).toHaveBeenCalledWith('/occupants/nearest.json', {
        params: {
          point: '12.3456,-78.9012'
        }
      });

      expect(result).toEqual(response);
    });

    it('propagates errors', async () => {
      const error = new Error('fetch failed');

      mockGeocoderGet.mockRejectedValue(error);

      await expect(
        getGeocoderNearestOccupant({
          longitude: '12.3456',
          latitude: '-78.9012'
        })
      ).rejects.toThrow(error);
    });
  });

  describe('searchGeocoderAddress', () => {
    it('returns address search results', async () => {
      const response = {
        addresses: [
          {
            fullAddress: '123 Example Ave, Sample City, ZZ'
          }
        ]
      };

      mockGeocoderGet.mockResolvedValue({
        data: response
      });

      const result = await searchGeocoderAddress({
        addressSearch: '123 Example'
      });

      expect(mockGeocoderGet).toHaveBeenCalledWith('/addresses.json', {
        params: {
          addressString: '123 Example',
          ...ADDRESS_CODER_QUERY_PARAMS
        }
      });

      expect(result).toEqual(response);
    });

    it('returns empty results', async () => {
      const response = {
        addresses: []
      };

      mockGeocoderGet.mockResolvedValue({
        data: response
      });

      const result = await searchGeocoderAddress({
        addressSearch: 'unknown-location'
      });

      expect(result).toEqual(response);
    });

    it('propagates errors', async () => {
      const error = new Error('fetch failed');

      mockGeocoderGet.mockRejectedValue(error);

      await expect(
        searchGeocoderAddress({
          addressSearch: '123 Example'
        })
      ).rejects.toThrow(error);
    });
  });

  describe('searchOrgBook', () => {
    it('returns orgbook search results', async () => {
      const response = {
        results: [
          {
            value: 'ACME TEST HOLDINGS INC.'
          }
        ]
      };

      mockOrgBookGet.mockResolvedValue({
        data: response
      });

      const result = await searchOrgBook({
        query: 'acme'
      });

      expect(mockOrgBookGet).toHaveBeenCalledWith('/search/autocomplete', {
        params: {
          q: 'acme',
          ...ORG_BOOK_QUERY_PARAMS
        }
      });

      expect(result).toEqual(response);
    });

    it('returns empty results', async () => {
      const response = {
        results: []
      };

      mockOrgBookGet.mockResolvedValue({
        data: response
      });

      const result = await searchOrgBook({
        query: 'no-match'
      });

      expect(result).toEqual(response);
    });

    it('propagates errors', async () => {
      const error = new Error('fetch failed');

      mockOrgBookGet.mockRejectedValue(error);

      await expect(
        searchOrgBook({
          query: 'acme'
        })
      ).rejects.toThrow(error);
    });
  });

  it('exports all service functions', () => {
    expect(externalApiService).toEqual({
      getGeocoderNearestOccupant,
      searchGeocoderAddress,
      searchOrgBook
    });
  });
});
