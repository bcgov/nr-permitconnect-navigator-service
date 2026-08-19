import { WritableRepository } from '#src/repositories/writable';

import type { PrismaTransactionClient } from '#src/db/database';

export class GroupRepository extends WritableRepository<PrismaTransactionClient['group']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.group, principal);
  }
}
