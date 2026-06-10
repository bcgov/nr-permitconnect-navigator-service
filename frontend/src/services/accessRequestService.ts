import type { AccessRequest, CreateAccessRequestRequest, ProcessAccessRequestRequest } from '@/types';
import { appAxios } from './interceptors';
import { useAppStore } from '@/store';

const PATH = 'accessRequest';

/**
 * Creates a new access request.
 * @param req - The request payload.
 * @returns A promise resolving to the created AccessRequest resource.
 */
export async function createAccessRequest(req: CreateAccessRequestRequest): Promise<AccessRequest> {
  const { data } = await appAxios().post<AccessRequest>(`${useAppStore().getInitiative.toLowerCase()}/${PATH}`, req);

  return data;
}

/**
 * Retrieves all access requests.
 * @returns A promise resolving to an array of AccessRequest resources.
 */
export async function listAccessRequests(): Promise<AccessRequest[]> {
  const { data } = await appAxios().get<AccessRequest[]>(`${useAppStore().getInitiative.toLowerCase()}/${PATH}`);

  return data;
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

  const { data } = await appAxios().post<AccessRequest>(
    `${useAppStore().getInitiative.toLowerCase()}/${PATH}/${accessRequestId}`,
    body
  );

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
export const accessRequestService = {
  createAccessRequest,
  listAccessRequests,
  processAccessRequest
};
