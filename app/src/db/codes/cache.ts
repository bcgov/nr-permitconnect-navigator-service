import { listCodeTablesService } from '../../services/code.ts';
import { getLogger } from '../../utils/log.ts';
import { CODE_TABLES } from './tables.ts';

import type { CachedCodeTable, CodeCache, CodeTableName, CodeTablesResult } from '../../types/codes.ts';

const log = getLogger(module.filename);

const toCachedCodeTable = (
  rows: { code: string; display: string; definition: string | null }[] = []
): CachedCodeTable => ({
  codes: rows.map((r) => r.code),
  displays: Object.fromEntries(rows.map((r) => [r.code, r.display])),
  definitions: Object.fromEntries(
    rows.filter((r): r is typeof r & { definition: string } => r.definition !== null).map((r) => [r.code, r.definition])
  )
});

const buildCodeCache = (codeTables?: CodeTablesResult): CodeCache =>
  Object.fromEntries(
    CODE_TABLES.map(({ name }) => [name, toCachedCodeTable(codeTables?.[name as CodeTableName])])
  ) as CodeCache;

let codeCache: CodeCache = buildCodeCache();

export const codeTable: CodeCache = new Proxy({} as Record<CodeTableName, CachedCodeTable>, {
  get: (_target, prop: string) => {
    const cachedTable = codeCache[prop as CodeTableName];

    if (!cachedTable) {
      throw new Error(
        `Code table '${prop}' is missing from the cache. Run 'npm run prisma:enums' to ensure correct code enums.`
      );
    }

    return cachedTable;
  }
});

/**
 * Pull the currently‑active codes from the DB and refresh the in‑memory arrays.
 * @returns true if successful, false otherwise
 */
export async function refreshCodeCaches(): Promise<boolean> {
  try {
    const codeTables: CodeTablesResult = await listCodeTablesService();

    codeCache = buildCodeCache(codeTables);

    log.debug('Codes cache refreshed');
    return true;
  } catch (error) {
    log.error('Codes cache refresh failed', error);
    return false;
  }
}
