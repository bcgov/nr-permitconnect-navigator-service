import { Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

import prisma from '../../db/dataConnection';
import { getLogger } from '../../components/log';
import { activityService } from '../../services';
import { isRecord, uuidToActivityId } from '../../utils/utils';

import type { CurrentContext } from '../../types';

const log = getLogger(module.filename);

/**
 * @constant inputTypeCasters
 * A mapping of Prisma types to their input casting functions.
 * This is used to convert input data to the appropriate Prisma types.
 * @type {Record<string, { in: (v: unknown) => unknown }>}
 */
const inputTypeCasters: Record<string, { in: (v: unknown) => unknown }> = {
  DateTime: {
    in: (v) => (typeof v === 'string' ? new Date(v) : v)
  },
  Decimal: {
    in: (v) => (typeof v === 'number' ? new Prisma.Decimal(v) : v)
  }
};

/**
 * @constant prismaTypeFieldIndex
 * An indexing of Prisma types to their fields in each model.
 * This is used to identify which fields need to be cast to specific Prisma types.
 * This index is built at runtime from the Prisma DMMF (Data Model Meta Format).
 * @type {Record<string, Record<string, string[]>>}
 */
export const prismaTypeFieldIndex: Record<string, Record<string, string[]>> = (() => {
  const index: Record<string, Record<string, string[]>> = {};

  for (const model of Prisma.dmmf.datamodel.models) {
    for (const field of model.fields) {
      (index[field.type] ??= {})[model.name] ??= [];
      index[field.type][model.name].push(field.name);
    }
  }
  return index;
})();

/**
 * @function castInput
 * Cast input data for specific Prisma types in a model.
 * This function modifies the input data in place, converting fields to their appropriate types.
 * @param {string} model The model name
 * @param {unknown} data The input data to cast
 * @param {string[]} prismaTypes An array of Prisma types to cast
 * @returns {void}
 *
 * @remarks Only runs if the input data is a record (object).
 *
 * @see {@link  https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types#working-with-datetime}
 * @see {@link https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types#working-with-decimal}
 */
export function castInput(model: string, data: unknown, prismaTypes: string[]): void {
  if (!isRecord(data)) return;

  for (const prismaType of prismaTypes) {
    const fields = prismaTypeFieldIndex[prismaType]?.[model];
    if (!fields) continue;

    const caster = inputTypeCasters[prismaType]?.in;
    if (!caster) continue;

    for (const f of fields) {
      data[f] = caster(data[f]);
    }
  }
}

/**
 * Checks the health of the database by executing a simple query.
 * @returns A promise that resolves to `true` if the database is healthy, or
 * `false` if the health check fails.
 * @throws Will log an error and return `false` if the database is not healthy.
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const result = await prisma.$queryRaw<{ result: number }[]>`SELECT 1 AS result`;
    log.debug('Database is healthy');
    return result[0]?.result === 1;
  } catch (error) {
    log.error('Database is unhealthy', error);
    return false;
  }
}

/**
 * Checks if the database schema matches the expected structure.
 * @returns A promise that resolves to `true` if the  database schema matches
 * the expected structure, or `false` otherwise.
 * @throws Will log an error and return `false` if the database introspection fails.
 */
export async function checkDatabaseSchema(): Promise<boolean> {
  // TODO: Should this be in a different location?
  const expected = Object.freeze({
    schemas: ['public', 'yars'],
    tables: [
      'access_request',
      'activity',
      'activity_contact',
      'contact',
      'document',
      'enquiry',
      'identity_provider',
      'initiative',
      'note',
      'permit',
      'permit_note',
      'permit_type',
      'user',
      'draft',
      'draft_code',
      'email_log',
      'electrification_project',
      'electrification_project_category_code',
      'electrification_project_type_code',
      'housing_project',
      'permit_type_initiative_xref'
    ]
  });

  const schemas = new Set(Prisma.dmmf.datamodel.models.map((x) => x.schema));
  const tables = new Set(Prisma.dmmf.datamodel.models.map((x) => x.dbName || x.name));
  const matches = {
    schemas: expected.schemas.every((t) => schemas.has(t)),
    tables: expected.tables.every((t) => tables.has(t))
  };

  log.debug('Database schema introspection', { matches });
  return matches.tables;
}

export function generateCreateStamps(currentContext: CurrentContext | undefined) {
  return {
    createdBy: currentContext?.userId ?? null,
    createdAt: new Date().toISOString()
  };
}

export function generateUpdateStamps(currentContext: CurrentContext | undefined) {
  return {
    updatedBy: (currentContext?.userId as string) ?? null,
    updatedAt: new Date().toISOString()
  };
}

/**
 * @function generateUniqueActivityId
 * Generate a new activityId, which are truncated UUIDs
 * If a collision is detected, generate new UUID and test again
 * @returns {Promise<string>} A string in title case
 */
export async function generateUniqueActivityId() {
  let id, queryResult;

  do {
    id = uuidToActivityId(uuidv4());
    queryResult = await activityService.getActivity(id);
  } while (queryResult);

  return id;
}
