import { Prisma } from '@prisma/client';
import { castNumericInput, castNumericOutput } from '../utils/utils';

const numericTransform = Prisma.defineExtension({
  query: {
    $allModels: {
      $allOperations({ model, operation, args, query }) {
        // Cast input data for all prisma operations from ISO string to Date
        if (operation === 'create' || operation === 'update') {
          if ('data' in args) castNumericInput(model, args.data);
        }

        if (operation === 'upsert') {
          const { create, update } = args;
          castNumericInput(model, create);
          castNumericInput(model, update);
        }

        if (operation === 'createMany' || operation === 'updateMany') {
          if ('data' in args) {
            const d = args.data;
            Array.isArray(d) ? d.forEach((row) => castNumericInput(model, row)) : castNumericInput(model, d);
          }
        }

        // Execute the query with the modified args
        const result = query(args);

        // Cast output data for all prisma operations from Prisma.Decimal and BigInt to number
        Array.isArray(result) ? result.forEach((r) => castNumericOutput(model, r)) : castNumericOutput(model, result);

        return result;
      }
    }
  },
  // TODO: Address statis result blocks and whether we should be generating them for type safety
  result: {
    document: {
      filesize: {
        // TODO: don't think it's needed in this context, but left for reference
        // needs: { filesize: true },
        compute(row: { filesize: bigint }): number {
          return Number(row.filesize);
        }
      }
    }
  }
});

export default numericTransform;
