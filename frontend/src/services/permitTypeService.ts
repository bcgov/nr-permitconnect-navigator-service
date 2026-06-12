import { api } from './apiClient';
import { createRouteBuilder } from './routeBuilder';

import type { ListPermitTypesRequest, PermitType } from '@/types';

/**
 * Base route builder and endpoint definitions for this resource.
 * Routes should be referenced through this object rather than
 * constructing endpoint paths directly within service methods.
 */
const permitTypeRoute = createRouteBuilder('permit-type');

const permitTypeRoutes = {
  root: () => permitTypeRoute()
} as const;

/**
 * Retrieves available permit types.
 * @param req - The request payload containing the optional initiative.
 * @returns A promise resolving to the available permit types.
 */
export function listPermitTypes(req: ListPermitTypesRequest): Promise<PermitType[]> {
  const { initiative } = req;

  return api.get<PermitType[]>(permitTypeRoutes.root(), {
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
export const permitTypeService = {
  listPermitTypes
};
