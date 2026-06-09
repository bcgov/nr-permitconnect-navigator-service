import { appAxios } from './interceptors';

import type { SearchUsersRequest, User } from '@/types';

const PATH = 'user';

/**
 * Searches users using the supplied filters.
 * @param req - Optional search criteria.
 * @returns A promise resolving to matching users.
 */
export async function searchUsers(req: SearchUsersRequest): Promise<User[]> {
  const { data } = await appAxios().post(PATH, req);

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
export const userService = {
  searchUsers
};
