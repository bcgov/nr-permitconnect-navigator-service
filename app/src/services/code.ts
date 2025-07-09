import prisma from '../db/dataConnection';

const service = {
  listAllCodeTables: async () => {
    const ElectrificationProjectType = await prisma.electrification_project_type_code.findMany({
      where: {
        active: true
      }
    });
    const ElectrificationProjectCategory = await prisma.electrification_project_category_code.findMany({
      where: {
        active: true
      }
    });
    const SourceSystem = await prisma.source_system_code.findMany({
      orderBy: {
        display: 'asc'
      }
    });

    return { ElectrificationProjectType, ElectrificationProjectCategory, SourceSystem };
  }
};

export default service;
