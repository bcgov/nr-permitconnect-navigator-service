import { WritableRepository } from './writable.ts';

import type { PrismaTransactionClient } from '../db/database.ts';

export class NoteHistoryRepository extends WritableRepository<PrismaTransactionClient['note_history']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.note_history, principal, true);
  }
}
