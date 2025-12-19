import { transactionWrapper } from '../../db/utils/transactionWrapper.ts';
import { listAllCodeTables } from '../../services/code.ts';
import { getLogger } from '../../utils/log.ts';

import type { PrismaTransactionClient } from '../../db/dataConnection.ts';
import type {
  ElectrificationProjectCategoryCode,
  ElectrificationProjectTypeCode,
  EscalationTypeCode,
  SourceSystemCode
} from '../../types/index.ts';

export let electrificationProjectTypeCodes: string[] = [];
export let electrificationProjectCategoryCodes: string[] = [];
export let escalationTypeCodes: string[] = [];
export let sourceSystemCodes: string[] = [];

const log = getLogger(module.filename);

/**
 * Pull the currently‑active codes from the DB and refresh
 * the in‑memory arrays.
 */
export async function refreshCodeCaches(): Promise<boolean> {
  try {
    const codeTables = await transactionWrapper<{
      ElectrificationProjectType: ElectrificationProjectTypeCode[];
      ElectrificationProjectCategory: ElectrificationProjectCategoryCode[];
      EscalationType: EscalationTypeCode[];
      SourceSystem: SourceSystemCode[];
    }>(async (tx: PrismaTransactionClient) => {
      return await listAllCodeTables(tx);
    });

    electrificationProjectTypeCodes = codeTables.ElectrificationProjectType.map((r) => r.code);
    electrificationProjectCategoryCodes = codeTables.ElectrificationProjectCategory.map((r) => r.code);
    escalationTypeCodes = codeTables.EscalationType.map((r) => r.code);
    sourceSystemCodes = codeTables.SourceSystem.map((r) => r.code);

    log.debug('Codes cache refreshed');
    return true;
  } catch (error) {
    log.error('Codes cache refresh failed', error);
    return false;
  }
}
