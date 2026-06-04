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

/** Hybrid default export object for backward compatibility */
export const mapService = {
  getPids
};
