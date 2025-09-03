import type { PrismaTransactionClient } from '../db/dataConnection';
import type {
  ElectrificationProjectCategoryCode,
  ElectrificationProjectTypeCode,
  EscalationTypeCode,
  SourceSystemCode
} from '../types';

/**
 * List all code tables
 * @param tx Prisma transaction client
 * @returns An object containing all code tables
 */
export const listAllCodeTables = async (
  tx: PrismaTransactionClient
): Promise<{
  ElectrificationProjectType: ElectrificationProjectTypeCode[];
  ElectrificationProjectCategory: ElectrificationProjectCategoryCode[];
  EscalationType: EscalationTypeCode[];
  SourceSystem: SourceSystemCode[];
}> => {
  const ElectrificationProjectType = await tx.electrification_project_type_code.findMany({
    where: {
      active: true
    }
  });

  const ElectrificationProjectCategory = await tx.electrification_project_category_code.findMany({
    where: {
      active: true
    }
  });

  const EscalationType = await tx.escalation_type_code.findMany({
    where: {
      active: true
    }
  });

  const SourceSystem = await tx.source_system_code.findMany({
    where: {
      active: true
    }
  });

  return { ElectrificationProjectType, ElectrificationProjectCategory, EscalationType, SourceSystem };
};
