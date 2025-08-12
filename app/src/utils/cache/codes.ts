import { getLogger } from '../../components/log';
import { listAllCodeTables } from '../../services/code';

export let electrificationProjectTypeCodes: string[] = [];
export let electrificationProjectCategoryCodes: string[] = [];
export let sourceSystemCodes: string[] = [];

const log = getLogger(module.filename);

/**
 * Pull the currently‑active codes from the DB and refresh
 * the in‑memory arrays.
 */
export async function refreshCodeCaches(): Promise<boolean> {
  try {
    const codeTables = await listAllCodeTables();

    electrificationProjectTypeCodes = codeTables.ElectrificationProjectType.map((r) => r.code);
    electrificationProjectCategoryCodes = codeTables.ElectrificationProjectCategory.map((r) => r.code);
    sourceSystemCodes = codeTables.SourceSystem.map((r) => r.code);

    log.debug('Codes cache refreshed');
    return true;
  } catch (error) {
    log.error('Codes cache refresh failed', error);
    return false;
  }
}
