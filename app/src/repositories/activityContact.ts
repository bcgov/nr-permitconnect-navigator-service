import { WritableRepository } from './writable.ts';

import type { PrismaTransactionClient } from '#src/db/database';

export class ActivityContactRepository extends WritableRepository<PrismaTransactionClient['activity_contact']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.activity_contact, principal, true);
  }
}
