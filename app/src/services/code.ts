import { CODE_TABLES } from '../db/codes/tables.ts';
import { unitOfWork } from '../repository/unitOfWork.ts';

import type { CodeTableName, CodeRow } from '../types/codes.ts';

/**
 * List all active code tables discovered from the Prisma schema.
 *
 * This service dynamically resolves code table models using Prisma's DMMF metadata:
 *
 * This uses `unitOfWork.executeRaw` because the set of tables is schema-driven
 * (not statically known), and adding repositories for each table would be
 * unnecessary boilerplate for a uniform, read-only access pattern.
 *
 * This is an intentional escape from the repository pattern. It is acceptable
 * here because the logic is generic, read-only, and already coupled to Prisma
 * metadata (DMMF + dynamic model access).
 * @returns Object mapping each code table name to its active rows.
 */
export const listCodeTablesService = async (): Promise<Record<CodeTableName, CodeRow[]>> => {
  return await unitOfWork.executeRaw(async (tx) => {
    const entries = await Promise.all(
      CODE_TABLES.map(async ({ name, model }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rows = (await (tx as any)[model].findMany({ where: { active: true } })) as CodeRow[];
        return [name, rows] as const;
      })
    );
    return Object.fromEntries(entries) as Record<CodeTableName, CodeRow[]>;
  });
};
