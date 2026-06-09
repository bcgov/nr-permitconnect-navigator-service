import { appAxios } from './interceptors';

import type { GetCodeTablesResponse } from '@/types';

const PATH = 'code';

/**
 * Retrieves all code tables.
 * @returns A promise resolving to the list of code tables.
 */
export async function getCodeTables(): Promise<GetCodeTablesResponse> {
  const { data } = await appAxios().get<GetCodeTablesResponse>(PATH);

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
export const codeService = {
  getCodeTables
};
