import { geocoderAxios, orgBookAxios } from './interceptors';
import { createRouteBuilder } from './routeBuilder';
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
 * Base route builder and endpoint definitions for this resource.
 * Routes should be referenced through this object rather than
 * constructing endpoint paths directly within service methods.
 */
const genericRoute = createRouteBuilder();

const geocoderRoutes = {
  nearestOccupant: () => genericRoute('occupants', 'nearest.json'),
  addressSearch: () => genericRoute('addresses.json')
} as const;

const orgBookRoutes = {
  search: () => genericRoute('search', 'autocomplete')
} as const;

/**
 * Get the nearest occupant for a given coordinate pair.
 * @param req - The coordinate request payload.
 * @returns A promise resolving to the nearest occupant data.
 */
export async function getGeocoderNearestOccupant(
  req: GetGeocoderNearestOccupantRequest
): Promise<GetGeocoderNearestOccupantResponse> {
  const { latitude, longitude } = req;

  const { data } = await geocoderAxios().get(geocoderRoutes.nearestOccupant(), {
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

  const { data } = await geocoderAxios().get<SearchGeocoderAddressResponse>(geocoderRoutes.addressSearch(), {
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

  const { data } = await orgBookAxios().get<SearchOrgBookResponse>(orgBookRoutes.search(), {
    params: {
      q: query,
      ...ORG_BOOK_QUERY_PARAMS
    }
  });

  return data;
}

/**
 * Backward compatibility layer for legacy default-export service usage.
 *
 * This object preserves the previous pattern:
 *   export default { ...serviceMethods }
 *
 * It may be removed once all consumers are migrated to named imports.
 */
export const externalApiService = {
  getGeocoderNearestOccupant,
  searchGeocoderAddress,
  searchOrgBook
};
