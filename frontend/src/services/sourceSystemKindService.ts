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

/** Hybrid default export object for backward compatibility */
export const sourceSystemKindService = {
  getSourceSystemKinds
};
