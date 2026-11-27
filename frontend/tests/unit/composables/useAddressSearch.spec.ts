import { effectScope } from 'vue';

import { useAddressSearch } from '@/composables/useAddressSearch';
import { externalApiService } from '@/services';
import * as utils from '@/utils/utils';

import type { GeocoderFeature, SearchGeocoderAddressResponse } from '@/types';

// Mocks

const searchGeocoderAddressSpy = vi.spyOn(externalApiService, 'searchGeocoderAddress');
const generalErrorHandlerSpy = vi.spyOn(utils, 'generalErrorHandler').mockImplementation(() => {});

// Fixtures

function geocoderFeature(fullAddress = '123 Main St, Victoria'): GeocoderFeature {
  return {
    type: 'Feature',
    geometry: { type: 'Point', crs: { type: 'name', properties: { code: 4326 } }, coordinates: [0, 0] },
    properties: { fullAddress } as GeocoderFeature['properties']
  } as GeocoderFeature;
}

function searchResponse(features: GeocoderFeature[]): SearchGeocoderAddressResponse {
  return { features } as SearchGeocoderAddressResponse;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

// Tests

describe('useAddressSearch', () => {
  describe('debounce', () => {
    it('does not search before 500ms have elapsed', () => {
      const { search } = useAddressSearch();
      search('123 Main');

      expect(searchGeocoderAddressSpy).not.toHaveBeenCalled();
    });

    it('searches with the trimmed input 500ms after the call', async () => {
      searchGeocoderAddressSpy.mockResolvedValue(searchResponse([]));

      const { search } = useAddressSearch();
      search('  123 Main  ');
      await vi.advanceTimersByTimeAsync(500);

      expect(searchGeocoderAddressSpy).toHaveBeenCalledExactlyOnceWith({ addressSearch: '123 Main' });
    });

    it('collapses rapid successive calls into a single request using the latest input', async () => {
      searchGeocoderAddressSpy.mockResolvedValue(searchResponse([]));

      const { search } = useAddressSearch();
      search('12');
      await vi.advanceTimersByTimeAsync(250);
      search('123');
      await vi.advanceTimersByTimeAsync(250);
      search('1234 Main');
      await vi.advanceTimersByTimeAsync(500);

      expect(searchGeocoderAddressSpy).toHaveBeenCalledExactlyOnceWith({ addressSearch: '1234 Main' });
    });

    it('populates suggestions once the debounced request resolves', async () => {
      searchGeocoderAddressSpy.mockResolvedValue(searchResponse([geocoderFeature()]));

      const { search, suggestions } = useAddressSearch();
      search('123 Main');
      await vi.advanceTimersByTimeAsync(500);

      expect(suggestions.value).toEqual([geocoderFeature()]);
    });
  });

  describe('minimum length', () => {
    it('does not search when the trimmed input is shorter than MIN_SEARCH_INPUT_LENGTH', async () => {
      const { search } = useAddressSearch();
      search('a');
      await vi.advanceTimersByTimeAsync(500);

      expect(searchGeocoderAddressSpy).not.toHaveBeenCalled();
    });

    it('treats whitespace-only input as too short', async () => {
      const { search } = useAddressSearch();
      search('   ');
      await vi.advanceTimersByTimeAsync(500);

      expect(searchGeocoderAddressSpy).not.toHaveBeenCalled();
    });

    it('clears existing suggestions as soon as the input becomes too short', () => {
      const { search, suggestions } = useAddressSearch();
      suggestions.value = [geocoderFeature()];
      search('a');

      expect(suggestions.value).toEqual([]);
    });

    it('cancels a pending debounced search when the input becomes too short before it fires', async () => {
      const { search } = useAddressSearch();
      search('123 Main');
      search('a');
      await vi.advanceTimersByTimeAsync(500);

      expect(searchGeocoderAddressSpy).not.toHaveBeenCalled();
    });
  });

  describe('out-of-order responses', () => {
    it('keeps only the result of the most recently started search', async () => {
      let resolveStale!: (value: SearchGeocoderAddressResponse) => void;
      let resolveLatest!: (value: SearchGeocoderAddressResponse) => void;

      searchGeocoderAddressSpy
        .mockImplementationOnce(() => new Promise((resolve) => (resolveStale = resolve)))
        .mockImplementationOnce(() => new Promise((resolve) => (resolveLatest = resolve)));

      const { search, suggestions } = useAddressSearch();
      search('123 M');
      await vi.advanceTimersByTimeAsync(500);
      search('123 Main St');
      await vi.advanceTimersByTimeAsync(500);

      expect(searchGeocoderAddressSpy).toHaveBeenCalledTimes(2);

      // Resolve the newer search before the stale one -- the stale response must still be ignored
      resolveLatest(searchResponse([geocoderFeature('123 Main St, Victoria')]));
      await Promise.resolve();
      resolveStale(searchResponse([geocoderFeature('123 Maple St, Victoria')]));
      await Promise.resolve();

      expect(suggestions.value).toEqual([geocoderFeature('123 Main St, Victoria')]);
    });

    it('ignores an error from a stale search', async () => {
      let rejectStale!: (reason: unknown) => void;

      searchGeocoderAddressSpy
        .mockImplementationOnce(() => new Promise((_resolve, reject) => (rejectStale = reject)))
        .mockResolvedValueOnce(searchResponse([geocoderFeature()]));

      const { search, suggestions } = useAddressSearch();
      search('123 M');
      await vi.advanceTimersByTimeAsync(500);
      search('123 Main St');
      await vi.advanceTimersByTimeAsync(500);

      rejectStale(new Error('stale failure'));
      await Promise.resolve();

      expect(generalErrorHandlerSpy).not.toHaveBeenCalled();
      expect(suggestions.value).toEqual([geocoderFeature()]);
    });
  });

  describe('errors', () => {
    it('shows one error toast and clears suggestions when the search fails', async () => {
      searchGeocoderAddressSpy.mockRejectedValue(new Error('geocoder down'));

      const { search, suggestions } = useAddressSearch();
      suggestions.value = [geocoderFeature()];
      search('123 Main');
      await vi.advanceTimersByTimeAsync(500);

      expect(generalErrorHandlerSpy).toHaveBeenCalledExactlyOnceWith(expect.any(Error));
      expect(suggestions.value).toEqual([]);
    });
  });

  describe('cancelling', () => {
    it('prevents a pending debounced search from firing', async () => {
      const { search, cancel } = useAddressSearch();
      search('123 Main');
      cancel();
      await vi.advanceTimersByTimeAsync(500);

      expect(searchGeocoderAddressSpy).not.toHaveBeenCalled();
    });

    it('ignores the response of an in-flight search once cancelled', async () => {
      let resolveSearch!: (value: SearchGeocoderAddressResponse) => void;
      searchGeocoderAddressSpy.mockImplementationOnce(() => new Promise((resolve) => (resolveSearch = resolve)));

      const { search, cancel, suggestions } = useAddressSearch();
      search('123 Main');
      await vi.advanceTimersByTimeAsync(500);
      cancel();

      resolveSearch(searchResponse([geocoderFeature()]));
      await Promise.resolve();

      expect(suggestions.value).toEqual([]);
    });

    it('cancels any pending search when the owning scope is disposed', async () => {
      const scope = effectScope();
      const { search } = scope.run(() => useAddressSearch())!;

      search('123 Main');
      scope.stop();
      await vi.advanceTimersByTimeAsync(500);

      expect(searchGeocoderAddressSpy).not.toHaveBeenCalled();
    });
  });

  describe('searchImmediate', () => {
    it('searches without waiting for the debounce', async () => {
      searchGeocoderAddressSpy.mockResolvedValue(searchResponse([geocoderFeature()]));

      const { searchImmediate, suggestions } = useAddressSearch();
      await searchImmediate('123 Main');

      expect(searchGeocoderAddressSpy).toHaveBeenCalledExactlyOnceWith({ addressSearch: '123 Main' });
      expect(suggestions.value).toEqual([geocoderFeature()]);
    });

    it('does not search when the trimmed input is too short', async () => {
      const { searchImmediate } = useAddressSearch();
      await searchImmediate(' a ');

      expect(searchGeocoderAddressSpy).not.toHaveBeenCalled();
    });
  });
});
