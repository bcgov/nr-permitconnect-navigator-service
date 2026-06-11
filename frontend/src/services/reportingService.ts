import { appAxios } from './interceptors';

import type { GetProjectPermitDataResponse } from '@/types';

const PATH = 'reporting';

/**
 * Retrieves permit data for electrification projects.
 * @returns A promise resolving to the electrification project permit data.
 */
export async function getElectrificationProjectPermitData(): Promise<GetProjectPermitDataResponse[]> {
  const { data } = await appAxios().get<GetProjectPermitDataResponse[]>(`${PATH}/electrificationProject/permit`);

  return data;
}

/**
 * Retrieves permit data for general projects.
 * @returns A promise resolving to the general project permit data.
 */
export async function getGeneralProjectPermitData(): Promise<GetProjectPermitDataResponse[]> {
  const { data } = await appAxios().get<GetProjectPermitDataResponse[]>(`${PATH}/generalProject/permit`);

  return data;
}

/**
 * Retrieves permit data for housing projects.
 * @returns A promise resolving to the housing project permit data.
 */
export async function getHousingProjectPermitData(): Promise<GetProjectPermitDataResponse[]> {
  const { data } = await appAxios().get<GetProjectPermitDataResponse[]>(`${PATH}/housingProject/permit`);

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
export const reportingService = {
  getElectrificationProjectPermitData,
  getGeneralProjectPermitData,
  getHousingProjectPermitData
};
