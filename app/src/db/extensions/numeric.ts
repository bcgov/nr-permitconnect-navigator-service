import { Prisma } from '@prisma/client';

const numericTransform = Prisma.defineExtension({
  result: {
    document: {
      filesize: {
        compute: ({ filesize }: { filesize: bigint }): number => Number(filesize)
      }
    }
  }
});

export default numericTransform;
