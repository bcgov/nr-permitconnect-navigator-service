import { appAxios } from './interceptors';
import { useAppStore } from '@/store';

import type {
  DeletePermitRequest,
  GetPermitRequest,
  ListPermitsRequest,
  ListPermitTypesRequest,
  Permit,
  PermitType,
  SearchPermitsRequest,
  SearchPermitsResponse,
  UpsertPermitRequest
} from '@/types';

const PATH = 'permit';

/**
 * Deletes a permit.
 * @param req - The request payload containing the permit ID.
 * @returns A promise resolving when the operation completes.
 */
export async function deletePermit(req: DeletePermitRequest): Promise<void> {
  const { permitId } = req;

  await appAxios().delete(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/${permitId}`);
}

/**
 * Retrieves a single permit.
 * @param req - The request payload containing the permit ID.
 * @returns A promise resolving to the requested `Permit` resource.
 */
export async function getPermit(req: GetPermitRequest): Promise<Permit> {
  const { permitId } = req;

  const { data } = await appAxios().get<Permit>(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/${permitId}`);

  return data;
}

/**
 * Retrieves available permit types for an initiative.
 * @param req - The request payload containing the initiative.
 * @returns A promise resolving to the available permit types.
 */
export async function listPermitTypes(req: ListPermitTypesRequest): Promise<PermitType[]> {
  const { initiative } = req;

  const { data } = await appAxios().get<PermitType[]>(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/types`, {
    params: { initiative }
  });

  return data;
}

/**
 * Retrieves all permits matching the supplied options.
 * @param req - Optional list filters.
 * @returns A promise resolving to an array of permits.
 */
export async function listPermits(req?: ListPermitsRequest): Promise<Permit[]> {
  const { data } = await appAxios().get<Permit[]>(`${useAppStore().getInitiative.toLowerCase()}/${PATH}`, {
    params: req
  });

  return data;
}

/**
 * Searches permits using the supplied filters.
 * @param req - Optional search criteria.
 * @returns A promise resolving to matching permits and total record count.
 */
export async function searchPermits(req?: SearchPermitsRequest): Promise<SearchPermitsResponse> {
  const {
    data: { permits, totalRecords }
  } = await appAxios().get<SearchPermitsResponse>(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/search`, {
    params: req
  });

  return { permits, totalRecords };
}

/**
 * Creates or updates a permit.
 * @param req - The permit payload to save.
 * @returns A promise resolving to the saved permit.
 */
export async function upsertPermit(req: UpsertPermitRequest): Promise<Permit> {
  const { data } = await appAxios().put<Permit>(`${useAppStore().getInitiative.toLowerCase()}/${PATH}`, req);

  return data;
}

/** Hybrid default export object for backward compatibility */
const permitService = {
  deletePermit,
  getPermit,
  listPermits,
  listPermitTypes,
  searchPermits,
  upsertPermit
};

export default permitService;
