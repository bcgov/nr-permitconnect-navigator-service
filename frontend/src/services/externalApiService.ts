import { geocoderAxios, orgBookAxios } from './interceptors';
import { ADDRESS_CODER_QUERY_PARAMS, ORG_BOOK_QUERY_PARAMS } from '@/utils/constants/housing';

import type {
  GetGeocoderNearestOccupantRequest,
  GetGeocoderNearestOccupantResponse,
  SearchGeocoderAddressRequest,
  SearchGeocoderAddressResponse,
  SearchOrgBookRequest,
  SearchOrgBookResponse
} from '@/types';

/**
 * Get the nearest occupant for a given coordinate pair.
 * @param req - The coordinate request payload.
 * @returns A promise resolving to the nearest occupant data.
 */
export async function getGeocoderNearestOccupant(
  req: GetGeocoderNearestOccupantRequest
): Promise<GetGeocoderNearestOccupantResponse> {
  const { latitude, longitude } = req;

  const { data } = await geocoderAxios().get('/occupants/nearest.json', {
    params: {
      point: `${longitude},${latitude}`
    }
  });

  return data;
}

/**
 * Search for addresses using the BC Geocoder service.
 * @param req - The address search request payload.
 * @returns A promise resolving to the geocoder search results.
 */
export async function searchGeocoderAddress(req: SearchGeocoderAddressRequest): Promise<SearchGeocoderAddressResponse> {
  const { addressSearch } = req;

  const { data } = await geocoderAxios().get<SearchGeocoderAddressResponse>('/addresses.json', {
    params: {
      addressString: addressSearch,
      ...ADDRESS_CODER_QUERY_PARAMS
    }
  });

  return data;
}

/**
 * Search OrgBook for organizations matching the provided name.
 * @param req - The search request payload.
 * @returns A promise resolving to the OrgBook search results.
 */
export async function searchOrgBook(req: SearchOrgBookRequest): Promise<SearchOrgBookResponse> {
  const { query } = req;

  const { data } = await orgBookAxios().get<SearchOrgBookResponse>('/search/autocomplete', {
    params: {
      q: query,
      ...ORG_BOOK_QUERY_PARAMS
    }
  });

  return data;
}

/** Hybrid default export object for backward compatibility */
export const externalApiService = {
  getGeocoderNearestOccupant,
  searchGeocoderAddress,
  searchOrgBook
};
