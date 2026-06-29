import { Prisma } from '@prisma/client';

const excludeOperations = new Set(['create', 'createMany', 'createManyAndReturn']);

const softDeleteModels = new Set(
  Prisma.dmmf.datamodel.models.filter((m) => m.fields.some((f) => f.name === 'deletedAt')).map((m) => m.name)
);

interface RelationInfo {
  targetModel: string;
  isList: boolean;
}

const modelRelations = new Map<string, Map<string, RelationInfo>>();

for (const model of Prisma.dmmf.datamodel.models) {
  const relations = new Map<string, RelationInfo>();
  for (const field of model.fields) {
    if (field.kind === 'object' && field.relationName) {
      relations.set(field.name, { targetModel: field.type, isList: field.isList });
    }
  }
  modelRelations.set(model.name, relations);
}

function processRelationArgs(
  relationArgs: Record<string, unknown>,
  relations: Map<string, RelationInfo>
): Record<string, unknown> {
  const newRelationArgs = { ...relationArgs };

  for (const [relKey, relVal] of Object.entries(newRelationArgs)) {
    const relationInfo = relations.get(relKey);

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

  const relations = modelRelations.get(modelName);
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
