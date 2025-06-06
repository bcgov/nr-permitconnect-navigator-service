import { Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

import prisma from '../../db/dataConnection';
import { getLogger } from '../../components/log';
import { activityService } from '../../services';
import { isRecord, uuidToActivityId } from '../../utils/utils';

import type { CurrentContext } from '../../types';

const log = getLogger(module.filename);

// TODO: XFieldsByModel constants are all very similar, consider refactoring to a single function
// That takes a type as an argument, type would be used by castXInput and castXOutput functions
/**
 * @constant bigIntFieldsByModel
 * A mapping of model names to their BigInt fields, extracted from the Prisma schema.
 * This is used to identify which fields need to be cast to/from BigInt.
 * @type {Record<string, string[]>}
 */
export const bigIntFieldsByModel: Record<string, string[]> = Prisma.dmmf.datamodel.models.reduce(
  (acc, model) => {
    acc[model.name] = model.fields.filter((f) => f.type === 'BigInt').map((f) => f.name);
    return acc;
  },
  {} as Record<string, string[]>
);

/**
 * @constant dateFieldsByModel
 * A mapping of model names to their DateTime fields, extracted from the Prisma schema.
 * This is used to identify which fields need to be cast to/from Date objects.
 * @type {Record<string, string[]>}
 */
export const dateFieldsByModel: Record<string, string[]> = Prisma.dmmf.datamodel.models.reduce(
  (acc, model) => {
    acc[model.name] = model.fields.filter((f) => f.type === 'DateTime').map((f) => f.name);
    return acc;
  },
  {} as Record<string, string[]>
);

/**
 * @constant decimalFieldsByModel
 * A mapping of model names to their Decimal fields, extracted from the Prisma schema.
 * This is used to identify which fields need to be cast to/from Prisma.Decimal objects.
 * @type {Record<string, string[]>}
 */
export const decimalFieldsByModel: Record<string, string[]> = Prisma.dmmf.datamodel.models.reduce(
  (acc, model) => {
    acc[model.name] = model.fields.filter((f) => f.type === 'Decimal').map((f) => f.name);
    return acc;
  },
  {} as Record<string, string[]>
);

// TODO: All the castXInput and castXOutput functions are very similar, consider refactoring
// Could be two functions that takes a type as an argument, type could also be used by XFieldByModel constants
/**
 * @function castDateOutputAsIso
 * Cast Date objects to ISO strings for output data
 * @param {string} model The model name
 * @param {unknown} row The output data to cast
 * @returns {void}
 * @see {@link https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types#working-with-datetime}
 * @description This function modifies the row in place, converting Date objects to ISO strings.
 * It is used to ensure that date fields are consistently formatted as ISO strings when retrieved from the database.
 */
export function castDateOutputAsIso(model: string, row: unknown): void {
  if (!isRecord(row)) return;
  const dateFields = dateFieldsByModel[model] ?? [];
  for (const df of dateFields) {
    const val = row[df];
    if (val instanceof Date) row[df] = val.toISOString();
  }
}

/**
 * @function castIsoInputAsDate
 * Cast Date strings to Date objects for input data
 * @param {string} model The model name
 * @param {unknown} data The input data to cast
 * @returns {void}
 * @see {@link https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types#working-with-datetime}
 */
export function castIsoInputAsDate(model: string, data: unknown): void {
  if (!isRecord(data)) return;
  const dateFields = dateFieldsByModel[model] ?? [];
  for (const df of dateFields) {
    const val = data[df];
    if (typeof val === 'string') data[df] = new Date(val);
  }
}

/**
 * @function castNumericInput
 * Cast numeric input data to Prisma.Decimal or BigInt types for specific fields in a model.
 * @param {string} model The model name
 * @param {unknown} data The input data to cast
 * @returns {void}
 * @see {@link https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types#working-with-decimal}
 * @see {@link https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types#working-with-bigint}
 */
export function castNumericInput(model: string, data: unknown): void {
  if (!isRecord(data)) return;

  for (const df of decimalFieldsByModel[model] ?? []) {
    const val = data[df];
    if (typeof val === 'number' || typeof val === 'string') {
      data[df] = new Prisma.Decimal(val);
    }
  }

  for (const bif of bigIntFieldsByModel[model] ?? []) {
    const val = data[bif];
    if (typeof val === 'number' || typeof val === 'string') {
      data[bif] = BigInt(val);
    }
  }
}

/**
 * @function castNumericOutput
 * Cast numeric output data from Prisma.Decimal or BigInt types for specific fields in a model.
 * @param {string} model The model name
 * @param {unknown} data The output data to cast
 * @returns {void}
 * @see {@link https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types#working-with-decimal}
 * @see {@link https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types#working-with-bigint}
 */
export function castNumericOutput(model: string, row: unknown): void {
  if (!isRecord(row)) return;

  for (const fld of decimalFieldsByModel[model] ?? []) {
    const val = row[fld];
    if (val instanceof Prisma.Decimal) {
      row[fld] = val.toNumber();
    }
  }

  for (const bif of bigIntFieldsByModel[model] ?? []) {
    const val = row[bif];
    if (typeof val === 'bigint') {
      row[bif] = Number(val);
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
