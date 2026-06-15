import { api } from './apiClient';
import { createInitiativeRouteBuilder } from './routeBuilder';

import type { AccessRequest, CreateAccessRequestRequest, ProcessAccessRequestRequest } from '@/types';

/**
 * Base route builder and endpoint definitions for this resource.
 * Routes should be referenced through this object rather than
 * constructing endpoint paths directly within service methods.
 */
const accessRequestRoute = createInitiativeRouteBuilder('access-request');

const accessRequestRoutes = {
  root: () => accessRequestRoute(),
  byId: (id: string) => accessRequestRoute(id)
} as const;

/**
 * Creates a new access request.
 * @param req - The request payload.
 * @returns A promise resolving to the created AccessRequest resource.
 */
export async function createAccessRequest(req: CreateAccessRequestRequest): Promise<AccessRequest> {
  return api.post<AccessRequest>(accessRequestRoutes.root(), req);
}

/**
 * Retrieves all access requests.
 * @returns A promise resolving to an array of AccessRequest resources.
 */
export async function listAccessRequests(): Promise<AccessRequest[]> {
  return api.get<AccessRequest[]>(accessRequestRoutes.root());
}

/**
 * Processes an existing access request.
 * This may represent approval, denial, revocation, role change, etc.
 *
 * @param req - The request payload containing the access request ID and action details.
 * @returns A promise resolving to the updated AccessRequest resource.
 */
export async function processAccessRequest(req: ProcessAccessRequestRequest): Promise<AccessRequest> {
  const { accessRequestId, ...body } = req;

  return api.post<AccessRequest>(accessRequestRoutes.byId(accessRequestId), body);
}

/**
 * Backward compatibility layer for legacy default-export service usage.
 *
 * This object preserves the previous pattern:
 *   export default { ...serviceMethods }
 *
 * It may be removed once all consumers are migrated to named imports.
 */
export const accessRequestService = {
  createAccessRequest,
  listAccessRequests,
  processAccessRequest
};
