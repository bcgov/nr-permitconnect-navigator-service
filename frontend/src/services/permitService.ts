import { api } from './apiClient';
import { createInitiativeRouteBuilder } from './routeBuilder';

import type {
  DeletePermitRequest,
  GetPermitRequest,
  ListPermitsRequest,
  Permit,
  SearchPermitsResponse,
  UpsertPermitRequest
} from '@/types';
/**
 * Base route builder and endpoint definitions for this resource.
 * Routes should be referenced through this object rather than
 * constructing endpoint paths directly within service methods.
 */
const permitRoute = createInitiativeRouteBuilder('permit');

const permitRoutes = {
  root: () => permitRoute(),
  byId: (permitId: string) => permitRoute(permitId),

  types: () => permitRoute('types'),
  search: () => permitRoute('search')
} as const;

/**
 * Deletes a permit.
 * @param req - The request payload containing the permit ID.
 * @returns A promise resolving when the operation completes.
 */
export function deletePermit(req: DeletePermitRequest): Promise<void> {
  const { permitId } = req;

  return api.delete(permitRoutes.byId(permitId));
}

/**
 * Retrieves a single permit.
 * @param req - The request payload containing the permit ID.
 * @returns A promise resolving to the requested `Permit` resource.
 */
export function getPermit(req: GetPermitRequest): Promise<Permit> {
  const { permitId } = req;

  return api.get<Permit>(permitRoutes.byId(permitId));
}

/**
 * Retrieves all permits matching the supplied options.
 * @param req - Optional list filters.
 * @returns A promise resolving to an array of permits.
 */
export function listPermits(req?: ListPermitsRequest): Promise<Permit[]> {
  return api.get<Permit[]>(permitRoutes.root(), {
    params: req
  });
}

/**
 * Searches permits using the supplied filters.
 * @param req - Optional search criteria.
 * @returns A promise resolving to matching permits and total record count.
 */
export function searchPermits(req?: ListPermitsRequest): Promise<SearchPermitsResponse> {
  return api.get<SearchPermitsResponse>(permitRoutes.search(), {
    params: req
  });
}

/**
 * Creates or updates a permit.
 * @param req - The permit payload to save.
 * @returns A promise resolving to the saved permit.
 */
export function upsertPermit(req: UpsertPermitRequest): Promise<Permit> {
  return api.put<Permit>(permitRoutes.root(), req);
}

/**
 * Backward compatibility layer for legacy default-export service usage.
 *
 * This object preserves the previous pattern:
 *   export default { ...serviceMethods }
 *
 * It may be removed once all consumers are migrated to named imports.
 */
export const permitService = {
  deletePermit,
  getPermit,
  listPermits,
  searchPermits,
  upsertPermit
};
