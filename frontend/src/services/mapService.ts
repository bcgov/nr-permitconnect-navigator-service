import { appAxios } from './interceptors';
import { useAppStore } from '@/store';

import type { GetPidsRequest } from '@/types';

const PATH = 'map';

/**
 * Get the PIDs for a project.
 * @param req - The request payload containing the project ID.
 * @returns A promise resolving to the project PIDs in CSV format.
 */
export async function getPids(req: GetPidsRequest): Promise<string> {
  const { projectId } = req;

  const { data } = await appAxios().get<string>(
    `${useAppStore().getInitiative.toLowerCase()}/${PATH}/pids/${projectId}`
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
export const mapService = {
  getPids
};
