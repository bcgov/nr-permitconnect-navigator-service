import { api } from './apiClient';
import { createInitiativeRouteBuilder } from './routeBuilder';

import type { GetPidsRequest } from '@/types';

/**
 * Base route builder and endpoint definitions for this resource.
 * Routes should be referenced through this object rather than
 * constructing endpoint paths directly within service methods.
 */
const mapRoute = createInitiativeRouteBuilder('map');

const mapRoutes = {
  pids: (projectId: string) => mapRoute('pids', projectId)
} as const;

/**
 * Get the PIDs for a project.
 * @param req - The request payload containing the project ID.
 * @returns A promise resolving to the project PIDs in CSV format.
 */
export function getPids(req: GetPidsRequest): Promise<string> {
  const { projectId } = req;

  return api.get<string>(mapRoutes.pids(projectId));
}

/**
 * Backward compatibility layer for legacy default-export service usage.
 *
 * This object preserves the previous pattern:
 *   export default { ...serviceMethods }
 *
 * It may be removed once all consumers are migrated to named imports.
 */
export const mapService = {
  getPids
};
