import { api } from './apiClient';
import { createRouteBuilder } from './routeBuilder';

import type { GetPeachSummaryRequest, GetPeachSummaryResponse } from '@/types';

/**
 * Base route builder and endpoint definitions for this resource.
 * Routes should be referenced through this object rather than
 * constructing endpoint paths directly within service methods.
 */
const peachRoute = createRouteBuilder('peach');

const peachRoutes = {
  record: () => peachRoute('record')
} as const;

/**
 * Get peach summary for permit tracking records.
 * @param req - The permit tracking payload.
 * @returns A promise resolving to the peach summary.
 */
export function getPeachSummary(req: GetPeachSummaryRequest): Promise<GetPeachSummaryResponse> {
  return api.post<GetPeachSummaryResponse>(peachRoutes.record(), req);
}

/**
 * Backward compatibility layer for legacy default-export service usage.
 *
 * This object preserves the previous pattern:
 *   export default { ...serviceMethods }
 *
 * It may be removed once all consumers are migrated to named imports.
 */
export const peachService = {
  getPeachSummary
};
