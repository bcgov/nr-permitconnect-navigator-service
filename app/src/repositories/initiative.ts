import { WritableRepository } from './writable.ts';

import type { PrismaTransactionClient } from '#src/db/database';

export class InitiativeRepository extends WritableRepository<PrismaTransactionClient['initiative']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.initiative, principal);
  }
}
