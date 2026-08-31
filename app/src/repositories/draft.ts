import { WritableRepository } from './writable.ts';

import type { PrismaTransactionClient } from '#src/db/database';

export class DraftRepository extends WritableRepository<PrismaTransactionClient['draft']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.draft, principal);
  }
}
