import { Prisma } from '#prismaClient';

import { modelRelations, type RelationInfo } from '#src/db/generators/output/relations.generated';

const excludeOperations = new Set(['create', 'createMany', 'createManyAndReturn']);

// Naming convention: `{Model[0].toUpperCase()}{model.slice(1)}ScalarFieldEnum` (Prisma's generated export name).
const scalarFieldEnums = Prisma as unknown as Record<string, Record<string, string> | undefined>;

const softDeleteModels = new Set<string>(
  Object.values(Prisma.ModelName).filter((name) => {
    const fieldEnum = scalarFieldEnums[`${name[0].toUpperCase()}${name.slice(1)}ScalarFieldEnum`];
    return fieldEnum !== undefined && 'deletedAt' in fieldEnum;
  })
);

function processRelationArgs(
  relationArgs: Record<string, unknown>,
  relations: Record<string, RelationInfo>
): Record<string, unknown> {
  const newRelationArgs = { ...relationArgs };

  for (const [relKey, relVal] of Object.entries(newRelationArgs)) {
    const relationInfo = relations[relKey];

    if (relationInfo && relVal) {
      const childArgs = typeof relVal === 'boolean' ? {} : { ...(relVal as Record<string, unknown>) };
      newRelationArgs[relKey] = applySoftDeleteFilter(relationInfo.targetModel, childArgs, relationInfo.isList);
    }
  }

  return newRelationArgs;
}

function applySoftDeleteFilter(
  modelName: string,
  args: Record<string, unknown>,
  filterThisLevel: boolean
): Record<string, unknown> {
  const nextArgs = { ...args };

  if (filterThisLevel && softDeleteModels.has(modelName)) {
    nextArgs.where = {
      ...((nextArgs.where ?? {}) as Record<string, unknown>),
      deletedAt: null
    };
  }

  const relations = modelRelations[modelName];
  if (!relations) {
    return nextArgs;
  }

  for (const key of ['include', 'select']) {
    const relationArgs = nextArgs[key] as Record<string, unknown> | undefined;

    if (relationArgs && typeof relationArgs === 'object') {
      nextArgs[key] = processRelationArgs(relationArgs, relations);
    }
  }

  return nextArgs;
}

function processArguments<T>(modelName: string, operation: string, args: T): T {
  if (excludeOperations.has(operation)) return args;

  const safeArgs = { ...((args ?? {}) as Record<string, unknown>) };

  // The includeDeleted flag is a custom argument to apply the soft delete filter or not.
  // It only applies to the top level of the query, not to any nested relations.
  const includeDeleted = safeArgs.includeDeleted;
  delete safeArgs.includeDeleted;

  if (includeDeleted === true) {
    return safeArgs as T;
  }

  return applySoftDeleteFilter(modelName, safeArgs, true) as T;
}

const filterDeletedTransform = Prisma.defineExtension({
  query: {
    $allModels: {
      $allOperations({ model, operation, args, query }) {
        const processedArgs = processArguments(model, operation, args);
        return query(processedArgs);
      }
    }
  }
});

export default filterDeletedTransform;
