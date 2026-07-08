import { WritableRepository } from './writable.ts';

import type { PrismaTransactionClient } from '../db/database.ts';

export class ActivityRepository extends WritableRepository<PrismaTransactionClient['activity']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.activity, principal, true);
  }
}
