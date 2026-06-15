import { api } from './apiClient';
import { createRouteBuilder } from './routeBuilder';

import type { CancelToken } from 'axios';
import type { ListIdirUsersRequest, ListIdirUsersResponse } from '@/types';

/**
 * Base route builder and endpoint definitions for this resource.
 * Routes should be referenced through this object rather than
 * constructing endpoint paths directly within service methods.
 */
const idirRoute = createRouteBuilder('sso/idir');

const idirRoutes = {
  users: () => idirRoute('users')
} as const;

/**
 * List idir users using the supplied filters.
 * @param req - Optional search criteria.
 * @returns A promise resolving to matching users.
 */
export function listIdirUsers(req: ListIdirUsersRequest, cancelToken?: CancelToken): Promise<ListIdirUsersResponse[]> {
  return api.get<ListIdirUsersResponse[]>(idirRoutes.users(), {
    params: req,
    cancelToken
  });
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
