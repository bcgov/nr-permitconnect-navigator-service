import { Prisma } from '@prisma/client';

// Prisma operations to exclude from filtering
const excludeOperations: readonly string[] = ['create', 'createMany', 'createManyAndReturn'];

/*
 * args is some crazy dynamic type
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function filterColumn(operation: string, args: any) {
  if (excludeOperations.includes(operation)) return args;

  if (!args.where) args = { ...args, where: {} };
  args.where = { ...args.where, deletedAt: null };

  return args;
}

/**
 * Models that are soft deleted to be added here
 * Using `$allModels` is not possible as that will affect views as well
 * This only filters data at the top level - will not filter relational includes
 */
const filterDeletedTransform = Prisma.defineExtension({
  query: {
    activity: {
      $allOperations({ operation, args, query }) {
        return query(filterColumn(operation, args));
      }
    },
    enquiry: {
      $allOperations({ operation, args, query }) {
        return query(filterColumn(operation, args));
      }
    },
    electrification_project: {
      $allOperations({ operation, args, query }) {
        return query(filterColumn(operation, args));
      }
    },
    housing_project: {
      $allOperations({ operation, args, query }) {
        return query(filterColumn(operation, args));
      }
    },
    note_history: {
      $allOperations({ operation, args, query }) {
        return query(filterColumn(operation, args));
      }
    },
    permit_note: {
      $allOperations({ operation, args, query }) {
        return query(filterColumn(operation, args));
      }
    }
  }
});

export default filterDeletedTransform;
