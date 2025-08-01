import prisma from '../db/dataConnection';

const service = {
  getSourceSystemKinds: async () => {
    const response = await prisma.source_system_kind.findMany({
      orderBy: {
        sourceSystem: 'asc'
      }
    });

    return response;
  }
};

export default service;
