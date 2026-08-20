import { WritableRepository } from './writable.ts';

import type { PrismaTransactionClient } from '#src/db/database';

export class PermitTypeRepository extends WritableRepository<PrismaTransactionClient['permit_type']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.permit_type, principal);
  }
}
