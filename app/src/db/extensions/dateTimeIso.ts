import { Prisma } from '@prisma/client';

import { castInput } from '../utils/utils';

const DATE_PRISMA_TYPES = ['DateTime'];

const dateTimeIsoTransform = Prisma.defineExtension({
  query: {
    $allModels: {
      $allOperations({ model, operation, args, query }) {
        // Cast input data for all prisma operations from ISO string to Date
        if (operation === 'create' || operation === 'update') {
          if ('data' in args) castInput(model, args.data, DATE_PRISMA_TYPES);
        }

        if (operation === 'upsert') {
          const { create, update } = args;
          castInput(model, create, DATE_PRISMA_TYPES);
          castInput(model, update, DATE_PRISMA_TYPES);
        }

        if (operation === 'createMany') {
          if ('data' in args) {
            const data = args.data;
            if (Array.isArray(data)) data.forEach((row) => castInput(model, row, DATE_PRISMA_TYPES));
            else castInput(model, data, DATE_PRISMA_TYPES);
          }
        }

        // Execute the query with the modified args
        return query(args);
      }
    }
  },
  result: {
    $allModels: {
      adjudicationDate: {
        compute: ({ adjudicationDate }: { adjudicationDate: Date | null }): string | null =>
          adjudicationDate?.toISOString() ?? null
      },
      bringForwardDate: {
        compute: ({ bringForwardDate }: { bringForwardDate: Date | null }): string | null =>
          bringForwardDate?.toISOString() ?? null
      },
      createdAt: {
        compute: ({ createdAt }: { createdAt: Date | null }): string | null => createdAt?.toISOString() ?? null
      },
      migrationTime: {
        compute: ({ migrationTime }: { migrationTime: Date | null }): string | null =>
          migrationTime?.toISOString() ?? null
      },
      statusLastVerified: {
        compute: ({ statusLastVerified }: { statusLastVerified: Date | null }): string | null =>
          statusLastVerified?.toISOString() ?? null
      },
      submittedAt: {
        compute: ({ submittedAt }: { submittedAt: Date | null }): string | null => submittedAt?.toISOString() ?? null
      },
      submittedDate: {
        compute: ({ submittedDate }: { submittedDate: Date | null }): string | null =>
          submittedDate?.toISOString() ?? null
      },
      updatedAt: {
        compute: ({ updatedAt }: { updatedAt: Date | null }): string | null => updatedAt?.toISOString() ?? null
      }
    }
  }
});

export default dateTimeIsoTransform;
