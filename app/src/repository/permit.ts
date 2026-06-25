import { WritableRepository } from './writable.ts';

import type { PrismaTransactionClient } from '../db/database.ts';

export class PermitRepository extends WritableRepository<PrismaTransactionClient['permit']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.permit, principal);
  }
}
