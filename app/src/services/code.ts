import { CODE_TABLES } from '../db/codes/tables.ts';

import type { CodeTableName, CodeRow } from '../db/codes/types.ts';
import type { PrismaTransactionClient } from '../db/dataConnection.ts';

/**
 * List all active code tables
 * @param tx Prisma transaction client
 * @returns An object containing all active code tables keyed by name
 */
export const listAllCodeTables = async (tx: PrismaTransactionClient): Promise<Record<CodeTableName, CodeRow[]>> => {
  const entries = await Promise.all(
    CODE_TABLES.map(async ({ name, model }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows = (await (tx as any)[model].findMany({ where: { active: true } })) as CodeRow[];
      return [name, rows] as const;
    })
  );
  return Object.fromEntries(entries) as Record<CodeTableName, CodeRow[]>;
};
