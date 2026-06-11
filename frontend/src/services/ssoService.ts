import { appAxios } from './interceptors';

import type { CancelToken } from 'axios';
import type { ListIdirUsersRequest, ListIdirUsersResponse } from '@/types';

/**
 * List idir users using the supplied filters.
 * @param req - Optional search criteria.
 * @returns A promise resolving to matching users.
 */
export async function listIdirUsers(
  req: ListIdirUsersRequest,
  cancelToken?: CancelToken
): Promise<ListIdirUsersResponse[]> {
  const { data } = await appAxios().get('sso/idir/users', { params: req, cancelToken: cancelToken });

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
export const ssoService = {
  listIdirUsers
};
