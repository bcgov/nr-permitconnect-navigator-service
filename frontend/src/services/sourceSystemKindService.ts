import { api } from './apiClient';
import { createRouteBuilder } from './routeBuilder';

import type { SourceSystemKind } from '@/types';

/**
 * Base route builder and endpoint definitions for this resource.
 * Routes should be referenced through this object rather than
 * constructing endpoint paths directly within service methods.
 */
const sourceSystemKindRoute = createRouteBuilder('source-system-kind');

const sourceSystemKindRoutes = {
  root: () => sourceSystemKindRoute()
} as const;

/**
 * Retrieves all source system kinds.
 * @returns A promise resolving to the list of source system kinds.
 */
export function listSourceSystemKinds(): Promise<SourceSystemKind[]> {
  return api.get<SourceSystemKind[]>(sourceSystemKindRoutes.root());
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
  listSourceSystemKinds
};
