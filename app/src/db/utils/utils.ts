import { Prisma } from '@prisma/client';
import { NIL, v4 as uuidv4 } from 'uuid';

import prisma, { PrismaTransactionClient } from '../../db/dataConnection';
import { getLogger } from '../../components/log';
import { getActivity } from '../../services/activity';
import { uuidToActivityId } from '../../utils/utils';

import type { CurrentContext } from '../../types';

const log = getLogger(module.filename);

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
      'draft',
      'draft_code',
      'electrification_project',
      'electrification_project_category_code',
      'electrification_project_type_code',
      'email_log',
      'enquiry',
      'housing_project',
      'identity_provider',
      'initiative',
      'note',
      'note_history',
      'permit',
      'permit_note',
      'permit_type',
      'user',
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
    createdBy: currentContext?.userId ?? NIL,
    createdAt: new Date()
  };
}

export function generateUpdateStamps(currentContext: CurrentContext | undefined) {
  return {
    updatedBy: (currentContext?.userId as string) ?? NIL,
    updatedAt: new Date()
  };
}

export function generateNullUpdateStamps() {
  return {
    updatedBy: null,
    updatedAt: null
  };
}

/**
 * Generate a new activityId, which are truncated UUIDs
 * If a collision is detected, generate new UUID and test again
 * @returns A string in title case
 */
export async function generateUniqueActivityId(tx: PrismaTransactionClient) {
  let id, queryResult;

  do {
    id = uuidToActivityId(uuidv4());
    // No op any errors, 404 is potentially expected here
    queryResult = await getActivity(tx, id).catch(() => {});
  } while (queryResult);

  return id;
}

export function jsonToPrismaInputJson(json: Prisma.JsonValue) {
  if (json === null) return null as unknown as Prisma.JsonNullValueInput;
  return json as Prisma.InputJsonValue;
}
