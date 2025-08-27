import { Prisma } from '@prisma/client';

const numericTransform = Prisma.defineExtension({
  result: {
    document: {
      filesize: {
        compute: ({ filesize }: { filesize: bigint | null }): number | null =>
          filesize !== null ? Number(filesize) : null
      }
    }
  }
});

export default numericTransform;
