import { WritableRepository } from './writable.ts';

import type { PrismaTransactionClient } from '../db/database.ts';

export class NoteRepository extends WritableRepository<PrismaTransactionClient['note']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.note, principal);
  }
}
