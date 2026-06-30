import { WritableRepository } from '../writable.ts';

import type { PrismaTransactionClient } from '../../db/database.ts';
export class GroupRepository extends WritableRepository<PrismaTransactionClient['group']> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.group, principal);
  }
}
