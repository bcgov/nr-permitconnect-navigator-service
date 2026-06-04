import { appAxios } from './interceptors';

import type { ReportingResponse } from '@/types';

const PATH = 'reporting';

/**
 * Retrieves permit data for electrification projects.
 * @returns A promise resolving to the electrification project permit data.
 */
export async function getElectrificationProjectPermitData(): Promise<ReportingResponse[]> {
  const { data } = await appAxios().get<ReportingResponse[]>(`${PATH}/electrificationProject/permit`);

  return data;
}

/**
 * Retrieves permit data for general projects.
 * @returns A promise resolving to the general project permit data.
 */
export async function getGeneralProjectPermitData(): Promise<ReportingResponse[]> {
  const { data } = await appAxios().get<ReportingResponse[]>(`${PATH}/generalProject/permit`);

  return data;
}

/**
 * Retrieves permit data for housing projects.
 * @returns A promise resolving to the housing project permit data.
 */
export async function getHousingProjectPermitData(): Promise<ReportingResponse[]> {
  const { data } = await appAxios().get<ReportingResponse[]>(`${PATH}/housingProject/permit`);

  return data;
}

/** Hybrid default export object for backward compatibility */
export const reportingService = {
  getElectrificationProjectPermitData,
  getGeneralProjectPermitData,
  getHousingProjectPermitData
};
