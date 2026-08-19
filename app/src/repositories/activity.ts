import { WritableRepository } from './writable.ts';

import type { PrismaTransactionClient } from '#src/db/database';

export class ActivityRepository extends WritableRepository<PrismaTransactionClient['activity']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.activity, principal, true);
  }
}
