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

/** Hybrid default export object for backward compatibility */
export const codeService = {
  getCodeTables
};
