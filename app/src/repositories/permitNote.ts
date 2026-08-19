import { WritableRepository } from './writable.ts';

import type { PrismaTransactionClient } from '#src/db/database';

export class PermitNoteRepository extends WritableRepository<PrismaTransactionClient['permit_note']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.permit_note, principal, true);
  }
}
