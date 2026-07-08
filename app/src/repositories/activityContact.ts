import { WritableRepository } from './writable.ts';

import type { PrismaTransactionClient } from '../db/database.ts';

export class ActivityContactRepository extends WritableRepository<PrismaTransactionClient['activity_contact']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.activity_contact, principal, true);
  }
}
