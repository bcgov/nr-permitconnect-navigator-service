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
    const EscalationType = await prisma.escalation_type_code.findMany({
      where: {
        active: true
      }
    });

    return { ElectrificationProjectType, ElectrificationProjectCategory, EscalationType };
  }
};

export default service;
