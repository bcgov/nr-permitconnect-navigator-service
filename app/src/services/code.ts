import type { PrismaTransactionClient } from '../db/dataConnection';
import type { ElectrificationProjectCategoryCode, ElectrificationProjectTypeCode, SourceSystemCode } from '../types';

/**
 * List all code tables
 * @param tx Prisma transaction client
 * @returns An object containing all code tables
 */
export const listAllCodeTables = async (
  tx: PrismaTransactionClient
): Promise<{
  ElectrificationProjectType: Array<ElectrificationProjectTypeCode>;
  ElectrificationProjectCategory: Array<ElectrificationProjectCategoryCode>;
  SourceSystem: Array<SourceSystemCode>;
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
  const SourceSystem = await prisma.source_system_code.findMany({
    where: {
      active: true
    }
  });

  return { ElectrificationProjectType, ElectrificationProjectCategory, SourceSystem };
};
