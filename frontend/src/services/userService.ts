import { api } from './apiClient';
import { createRouteBuilder } from './routeBuilder';

import type { ListUsersRequest, User } from '@/types';

/**
 * Base route builder and endpoint definitions for this resource.
 * Routes should be referenced through this object rather than
 * constructing endpoint paths directly within service methods.
 */
const userRoute = createRouteBuilder('user');

const userRoutes = {
  root: () => userRoute()
} as const;

/**
 * Lists users using the supplied filters.
 * @param req - Optional search criteria.
 * @returns A promise resolving to matching users.
 */
export function listUsers(req: ListUsersRequest): Promise<User[]> {
  return api.post<User[]>(userRoutes.root(), req);
}

/**
 * Backward compatibility layer for legacy default-export service usage.
 *
 * This object preserves the previous pattern:
 *   export default { ...serviceMethods }
 *
 * It may be removed once all consumers are migrated to named imports.
 */
export const userService = {
  listUsers
};
