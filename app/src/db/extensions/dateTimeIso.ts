import { Prisma } from '@prisma/client';

import { castIsoInputAsDate, castDateOutputAsIso } from '../utils/utils';

const dateTimeIsoTransform = Prisma.defineExtension({
  query: {
    $allModels: {
      $allOperations({ model, operation, args, query }) {
        // Cast input data for all prisma operations from ISO string to Date
        if (operation === 'create' || operation === 'update') {
          if ('data' in args) castIsoInputAsDate(model, args.data);
        }

        if (operation === 'upsert') {
          const { create, update } = args;
          castIsoInputAsDate(model, create);
          castIsoInputAsDate(model, update);
        }

        if (operation === 'createMany') {
          if ('data' in args) {
            const data = args.data;
            if (Array.isArray(data)) data.forEach((row) => castIsoInputAsDate(model, row));
            else castIsoInputAsDate(model, data);
          }
        }

        // Execute the query with the modified args
        const result = query(args);

        // Cast output data for all prisma operations from Date to ISO string
        if (Array.isArray(result)) result.forEach((r) => castDateOutputAsIso(model, r));
        else castDateOutputAsIso(model, result);

        return result;
      }
    }
  },
  // Dynamic result generation does nothing for compile time type safety, moved result transformation to the query block
  // TODO: Consider generating a static result block with a script on build time to improve type safety
  // Result block left for reference, delete result block before production
  // result: Object.fromEntries(
  //   Object.entries(dateFieldsByModel).map(([model, fields]) => [
  //     model,
  //     Object.fromEntries(
  //       fields.map((field) => [
  //         field,
  //         {
  //           needs: { [field]: true },
  //           compute: (row: Record<string, Date | string | null>) =>
  //             row[field] instanceof Date ? row[field].toISOString() : row[field]
  //         }
  //       ])
  //     )
  //   ])
  // ) as any // eslint-disable-line

  // This is what a static result block would look like
  // Check getActivities' return type in services/activity.ts for type safety usage
  result: {
    activity: {
      createdAt: {
        needs: { createdAt: true },
        compute(row: { createdAt: Date | null }): string | null {
          return row.createdAt ? row.createdAt.toISOString() : null;
        }
      },
      updatedAt: {
        needs: { updatedAt: true },
        compute(row: { updatedAt: Date | null }): string | null {
          return row.updatedAt ? row.updatedAt.toISOString() : null;
        }
      }
    },
    document: {
      createdAt: {
        needs: { createdAt: true },
        compute(row: { createdAt: Date | null }): string | null {
          return row.createdAt ? row.createdAt.toISOString() : null;
        }
      },
      updatedAt: {
        needs: { updatedAt: true },
        compute(row: { updatedAt: Date | null }): string | null {
          return row.updatedAt ? row.updatedAt.toISOString() : null;
        }
      }
    }
  }
});

export default dateTimeIsoTransform;
