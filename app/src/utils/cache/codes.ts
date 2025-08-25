import { getLogger } from '../../components/log';
import { transactionWrapper } from '../../db/utils/transactionWrapper';
import { listAllCodeTables } from '../../services/code';

import type { PrismaTransactionClient } from '../../db/dataConnection';
import type { ElectrificationProjectCategoryCode, ElectrificationProjectTypeCode, SourceSystemCode } from '../../types';

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
    const codeTables = await transactionWrapper<{
      ElectrificationProjectType: Array<ElectrificationProjectTypeCode>;
      ElectrificationProjectCategory: Array<ElectrificationProjectCategoryCode>;
      SourceSystem: Array<SourceSystemCode>;
    }>(async (tx: PrismaTransactionClient) => {
      return await listAllCodeTables(tx);
    });

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
