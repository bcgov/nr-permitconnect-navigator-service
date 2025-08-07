import prisma from '../db/dataConnection';

export const getSourceSystemKinds = async () => {
  const response = await prisma.source_system_kind.findMany({
    orderBy: {
      sourceSystem: 'asc'
    }
  });

  return response;
};
