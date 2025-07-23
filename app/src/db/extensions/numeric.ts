import { Prisma } from '@prisma/client';
import { castInput } from '../utils/utils';

const NUMERIC_PRISMA_TYPES = ['Decimal'];

const numericTransform = Prisma.defineExtension({
  // query: {
  //   $allModels: {
  //     $allOperations({ model, operation, args, query }) {
  //       // Cast input data for all prisma operations from ISO string to Date
  //       if (operation === 'create' || operation === 'update') {
  //         if ('data' in args) castInput(model, args.data, NUMERIC_PRISMA_TYPES);
  //       }

  //       if (operation === 'upsert') {
  //         const { create, update } = args;
  //         castInput(model, create, NUMERIC_PRISMA_TYPES);
  //         castInput(model, update, NUMERIC_PRISMA_TYPES);
  //       }

  //       if (operation === 'createMany' || operation === 'updateMany') {
  //         if ('data' in args) {
  //           const d = args.data;
  //           Array.isArray(d)
  //             ? d.forEach((row) => castInput(model, row, NUMERIC_PRISMA_TYPES))
  //             : castInput(model, d, NUMERIC_PRISMA_TYPES);
  //         }
  //       }

  //       return query(args);
  //     }
  //   }
  // },
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
