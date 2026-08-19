import { WritableRepository } from './writable.ts';

import type { PrismaTransactionClient } from '#src/db/database';

export class NoteRepository extends WritableRepository<PrismaTransactionClient['note']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.note, principal, true);
  }
}
