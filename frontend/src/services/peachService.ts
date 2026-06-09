import { appAxios } from './interceptors';

import type { GetPeachSummaryRequest, PeachSummary } from '@/types';

const PATH = 'peach';

/**
 * Get peach summary for permit tracking records.
 * @param req - The permit tracking payload.
 * @returns A promise resolving to the peach summary.
 */
export async function getPeachSummary(req: GetPeachSummaryRequest): Promise<PeachSummary> {
  const { data } = await appAxios().post<PeachSummary>(`${PATH}/record`, req);

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
export const peachService = {
  getPeachSummary
};
