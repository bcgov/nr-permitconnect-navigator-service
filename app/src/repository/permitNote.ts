import { WritableRepository } from './writable.ts';

import type { PrismaTransactionClient } from '../db/database.ts';

export class PermitNoteRepository extends WritableRepository<PrismaTransactionClient['permit_note']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.permit_note, principal);
  }
}
