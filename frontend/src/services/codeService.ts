import { api } from './apiClient';
import { createRouteBuilder } from './routeBuilder';

import type { GetCodeTablesResponse } from '@/types';

/**
 * Base route builder and endpoint definitions for this resource.
 * Routes should be referenced through this object rather than
 * constructing endpoint paths directly within service methods.
 */
const codeRoute = createRouteBuilder('code');

const codeRoutes = {
  root: () => codeRoute()
} as const;

/**
 * Retrieves all code tables.
 * @returns A promise resolving to the list of code tables.
 */
export function getCodeTables(): Promise<GetCodeTablesResponse> {
  return api.get<GetCodeTablesResponse>(codeRoutes.root());
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
