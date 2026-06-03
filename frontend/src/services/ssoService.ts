import { appAxios } from './interceptors';

import type { CancelToken } from 'axios';
import type { SearchIdirUsersRequest, SearchIdirUsersResponse } from '@/types';

/**
 * Searches idir users using the supplied filters.
 * @param req - Optional search criteria.
 * @returns A promise resolving to matching users.
 */
export async function searchIdirUsers(
  req: SearchIdirUsersRequest,
  cancelToken?: CancelToken
): Promise<SearchIdirUsersResponse[]> {
  const { data } = await appAxios().get('sso/idir/users', { params: req, cancelToken: cancelToken });

  return data;
}

/** Hybrid default export object for backward compatibility */
export const ssoService = {
  searchIdirUsers
};
