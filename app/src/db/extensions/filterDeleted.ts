import { Prisma } from '@prisma/client';

// Prisma find operations to filter on
const findOperations: readonly string[] = [
  'findUnique',
  'findUniqueOrThrow',
  'findFirst',
  'findFirstOrThrow',
  'findMany'
];

/*
 * Can't seem to get these param types from Prisma
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function filterActivity(operation: any, args: any) {
  if (findOperations.includes(operation)) {
    args.where = args.where ? { AND: [args.where, { activity: { isDeleted: false } }] } : {};
  }

  return args;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function filterColumn(operation: any, args: any) {
  if (findOperations.includes(operation)) {
    args.where = args.where ? { AND: [args.where, { isDeleted: false }] } : {};
  }

  return args;
}

const filterDeletedTransform = Prisma.defineExtension({
  query: {
    electrification_project: {
      $allOperations({ operation, args, query }) {
        return query(filterActivity(operation, args));
      }
    },
    housing_project: {
      $allOperations({ operation, args, query }) {
        return query(filterActivity(operation, args));
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
