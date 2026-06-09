import { appAxios } from './interceptors';

import type { DeleteSubjectGroupRequest, GetGroupsRequest, GetPermissionsResponse, Group } from '@/types';

const PATH = 'yars';

/**
 * Get groups for a given initiative.
 * @param req - The request payload.
 * @returns A promise resolving to an array of groups.
 */
export async function getGroups(req: GetGroupsRequest): Promise<Group[]> {
  const { initiative } = req;

  const { data } = await appAxios().get<Group[]>(`${PATH}/groups`, {
    params: { initiative }
  });

  return data;
}

/**
 * Get permissions for the current context.
 * @returns A promise resolving to permissions data.
 */
export async function getPermissions(): Promise<GetPermissionsResponse> {
  const { data } = await appAxios().get<GetPermissionsResponse>(`${PATH}/permissions`);

  return data;
}

/**
 * Delete a subject group.
 * @param req - The request payload.
 * @returns A promise resolving when deletion is complete.
 */
export async function deleteSubjectGroup(req: DeleteSubjectGroupRequest): Promise<void> {
  const { sub, groupId } = req;

  await appAxios().delete<void>(`${PATH}/subject/group`, {
    data: { sub, groupId }
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
export const yarsService = {
  getGroups,
  getPermissions,
  deleteSubjectGroup
};
