import { WritableRepository } from './writable.ts';

import type { PrismaTransactionClient } from '../db/database.ts';

export class InitiativeRepository extends WritableRepository<PrismaTransactionClient['initiative']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.initiative, principal);
  }
}
