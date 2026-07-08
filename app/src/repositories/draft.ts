import { WritableRepository } from './writable.ts';

import type { PrismaTransactionClient } from '../db/database.ts';

export class DraftRepository extends WritableRepository<PrismaTransactionClient['draft']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.draft, principal);
  }
}
