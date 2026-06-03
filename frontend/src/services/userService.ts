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

/** Hybrid default export object for backward compatibility */
export const userService = {
  searchUsers
};
