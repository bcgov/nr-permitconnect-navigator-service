import { api } from './apiClient';
import { createRouteBuilder } from './routeBuilder';

import type { GetProjectPermitDataResponse } from '@/types';

/**
 * Base route builder and endpoint definitions for this resource.
 * Routes should be referenced through this object rather than
 * constructing endpoint paths directly within service methods.
 */
const reportingRoute = createRouteBuilder('reporting');

const reportingRoutes = {
  electrificationProjectPermit: () => reportingRoute('electrificationProject', 'permit'),
  generalProjectPermit: () => reportingRoute('generalProject', 'permit'),
  housingProjectPermit: () => reportingRoute('housingProject', 'permit')
} as const;

/**
 * Retrieves permit data for electrification projects.
 * @returns A promise resolving to the electrification project permit data.
 */
export function getElectrificationProjectPermitData(): Promise<GetProjectPermitDataResponse[]> {
  return api.get<GetProjectPermitDataResponse[]>(reportingRoutes.electrificationProjectPermit());
}

/**
 * Retrieves permit data for general projects.
 * @returns A promise resolving to the general project permit data.
 */
export function getGeneralProjectPermitData(): Promise<GetProjectPermitDataResponse[]> {
  return api.get<GetProjectPermitDataResponse[]>(reportingRoutes.generalProjectPermit());
}

/**
 * Retrieves permit data for housing projects.
 * @returns A promise resolving to the housing project permit data.
 */
export function getHousingProjectPermitData(): Promise<GetProjectPermitDataResponse[]> {
  return api.get<GetProjectPermitDataResponse[]>(reportingRoutes.housingProjectPermit());
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
