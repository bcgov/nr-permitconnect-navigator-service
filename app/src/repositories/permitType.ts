import { WritableRepository } from './writable.ts';

import type { PrismaTransactionClient } from '../db/database.ts';

export class PermitTypeRepository extends WritableRepository<PrismaTransactionClient['permit_type']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.permit_type, principal);
  }
}
