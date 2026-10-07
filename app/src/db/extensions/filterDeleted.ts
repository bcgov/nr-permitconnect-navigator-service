import { Prisma } from '#prismaClient';

import { modelRelations, type RelationInfo } from '#src/db/generated/relations/relations.generated';

const excludeOperations = new Set(['create', 'createMany', 'createManyAndReturn']);

// Naming convention: `{Model[0].toUpperCase()}{model.slice(1)}ScalarFieldEnum` (Prisma's generated export name)
const scalarFieldEnums = Prisma as unknown as Record<string, Record<string, string> | undefined>;

const softDeleteModels = new Set<string>(
  Object.values(Prisma.ModelName).filter((name) => {
    const fieldEnum = scalarFieldEnums[`${name[0].toUpperCase()}${name.slice(1)}ScalarFieldEnum`];
    return fieldEnum !== undefined && 'deletedAt' in fieldEnum;
  })
);

type Where = Record<string, unknown>;

const isObject = (value: unknown): value is Where =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function live(modelName: string, where: unknown): unknown {
  const walked = filterWhere(modelName, where);
  return softDeleteModels.has(modelName) && isObject(walked) ? { ...walked, deletedAt: null } : walked;
}

// False when the filter is always true, e.g. {}, { AND: [] } or { OR: [{}, ...] }; OR: [] is always false
function hasConditions(where: unknown): boolean {
  if (where === undefined) return false;
  if (!isObject(where)) return true;

  return Object.entries(where).some(([key, value]) => {
    const branches = Array.isArray(value) ? value : [value];
    if (key === 'OR') return value !== undefined && branches.every(hasConditions);
    if (key === 'AND' || key === 'NOT') return branches.some(hasConditions);
    return value !== undefined;
  });
}

function filterListRelation(modelName: string, filter: unknown): unknown {
  if (!isObject(filter)) return filter;

  const { some, every, none, ...rest } = filter;
  const next: Where = { ...rest };

  if (some !== undefined) next.some = live(modelName, some);

  if (!softDeleteModels.has(modelName)) {
    if (every !== undefined) next.every = filterWhere(modelName, every);
    if (none !== undefined) next.none = filterWhere(modelName, none);
    return next;
  }

  // An empty every is always true, and Prisma reads the NOT: {} its rewrite would produce as no condition
  const everyHasConditions = isObject(every) && hasConditions(every);
  if (every !== undefined && !everyHasConditions) next.every = every;

  // A nested deletedAt filter would make `every` fail whenever any soft deleted row exists
  if (everyHasConditions) {
    const failsEvery = { NOT: filterWhere(modelName, every) };
    next.none = {
      deletedAt: null,
      ...(none === undefined ? failsEvery : { OR: [filterWhere(modelName, none), failsEvery] })
    };
  } else if (none !== undefined) {
    next.none = live(modelName, none);
  }

  return next;
}

// Returns one filter per constraint, as `is` and `isNot` rewrites can collide on the same key
function filterToOneRelation(modelName: string, filter: unknown): unknown[] {
  const soft = softDeleteModels.has(modelName);

  if (filter === null) return [soft ? { isNot: { deletedAt: null } } : null];
  if (!isObject(filter)) return [filter];
  if (!('is' in filter) && !('isNot' in filter)) return [live(modelName, filter)];

  const { is, isNot } = filter;
  const parts: unknown[] = [];

  if (is === null) parts.push(soft ? { isNot: { deletedAt: null } } : { is: null });
  else if (is !== undefined) parts.push({ is: live(modelName, is) });

  if (isNot === null) parts.push(soft ? { is: { deletedAt: null } } : { isNot: null });
  else if (isNot !== undefined) parts.push({ isNot: live(modelName, isNot) });

  return parts;
}

function filterWhere(modelName: string, where: unknown): unknown {
  if (!isObject(where)) return where;

  const relations = modelRelations[modelName] ?? {};
  const next: Where = {};
  const extraAnd: Where[] = [];

  for (const [key, value] of Object.entries(where)) {
    const relation = relations[key];

    if (key === 'AND' || key === 'OR' || key === 'NOT') {
      next[key] = Array.isArray(value) ? value.map((w) => filterWhere(modelName, w)) : filterWhere(modelName, value);
    } else if (!relation) {
      next[key] = value;
    } else if (relation.isList) {
      next[key] = filterListRelation(relation.targetModel, value);
    } else {
      const parts = filterToOneRelation(relation.targetModel, value);

      if (parts.length <= 1) next[key] = parts[0] ?? value;
      else extraAnd.push(...parts.map((part) => ({ [key]: part })));
    }
  }

  if (extraAnd.length > 0) {
    next.AND = [...(next.AND === undefined ? [] : [next.AND].flat()), ...extraAnd];
  }

  return next;
}

// `_count: true` counts every list relation
function countSelect(count: unknown, relations: Record<string, RelationInfo>): Where | undefined {
  if (count === true) {
    return Object.fromEntries(Object.entries(relations).flatMap(([key, rel]) => (rel.isList ? [[key, true]] : [])));
  }

  if (isObject(count) && isObject(count.select)) return count.select;

  return undefined;
}

function filterCount(count: unknown, relations: Record<string, RelationInfo>): unknown {
  const select = countSelect(count, relations);
  if (!select) return count;

  const filtered = Object.fromEntries(
    Object.entries(select).map(([key, value]) => {
      const relation = relations[key];
      if (!relation?.isList || !value) return [key, value];

      const countArgs = isObject(value) ? value : {};
      return [key, { ...countArgs, where: live(relation.targetModel, countArgs.where ?? {}) }];
    })
  );

  return { ...(isObject(count) ? count : {}), select: filtered };
}

function processRelationArgs(
  relationArgs: Record<string, unknown>,
  relations: Record<string, RelationInfo>
): Record<string, unknown> {
  const newRelationArgs = { ...relationArgs };

  for (const [relKey, relVal] of Object.entries(newRelationArgs)) {
    if (relKey === '_count') {
      newRelationArgs._count = filterCount(relVal, relations);
      continue;
    }

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

  if (nextArgs.where !== undefined) {
    nextArgs.where = filterWhere(modelName, nextArgs.where);
  }

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

  // Custom includeDeleted flag disables soft delete filtering for the entire query, including nested relations
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
