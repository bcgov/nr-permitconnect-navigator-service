import { appAxios } from './interceptors';

import type { SourceSystemKind } from '@/types';

const path = 'sourceSystemKind';

/**
 * Retrieves all source system kinds.
 * @returns A promise resolving to the list of source system kinds.
 */
export async function getSourceSystemKinds(): Promise<SourceSystemKind[]> {
  const { data } = await appAxios().get<SourceSystemKind[]>(path);
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
export const sourceSystemKindService = {
  getSourceSystemKinds
};
