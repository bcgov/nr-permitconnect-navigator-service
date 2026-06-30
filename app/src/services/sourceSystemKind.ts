import { unitOfWork } from '../repository/unitOfWork.ts';

import type { SourceSystemKind } from '../types/index.ts';

/**
 * Get all source system kinds and include their associated permit type ids
 * @returns A Promise that resolves to an array of source system kinds along with their permit type ids
 */
export const listSourceSystemKindsService = async (): Promise<SourceSystemKind[]> => {
  return await unitOfWork.execute(async ({ sourceSystemKind }) => {
    return await sourceSystemKind.list();
  });
};
