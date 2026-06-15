import { api } from './apiClient';
import { createRouteBuilder } from './routeBuilder';

import type { DeleteSubjectGroupRequest, ListGroupsRequest, GetAuthorizationContextResponse, Group } from '@/types';
/**
 * Base route builder and endpoint definitions for this resource.
 * Routes should be referenced through this object rather than
 * constructing endpoint paths directly within service methods.
 */
const yarsRoute = createRouteBuilder('yars');

const yarsRoutes = {
  subjectGroup: () => yarsRoute('subject', 'group'),
  permissions: () => yarsRoute('permissions'),
  groups: () => yarsRoute('groups')
} as const;

/**
 * Delete a subject group.
 * @param req - The request payload.
 * @returns A promise resolving when deletion is complete.
 */
export function deleteSubjectGroup(req: DeleteSubjectGroupRequest): Promise<void> {
  const { sub, groupId } = req;

  return api.delete(yarsRoutes.subjectGroup(), {
    data: { sub, groupId }
  });
}

/**
 * Get authorization context (groups + permissions) for the current context.
 * @returns A promise resolving to permissions data.
 */
export function getAuthorizationContext(): Promise<GetAuthorizationContextResponse> {
  return api.get<GetAuthorizationContextResponse>(yarsRoutes.permissions());
}

/**
 * Lists groups for a given initiative.
 * @param req - The request payload.
 * @returns A promise resolving to an array of groups.
 */
export function listGroups(req: ListGroupsRequest): Promise<Group[]> {
  const { initiative } = req;

  return api.get<Group[]>(yarsRoutes.groups(), {
    params: { initiative }
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
  deleteSubjectGroup,
  getAuthorizationContext,
  listGroups
};
