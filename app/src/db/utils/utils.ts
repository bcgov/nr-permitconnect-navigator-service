import { Knex } from 'knex';
import { Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

import prisma from '../../db/dataConnection.ts';
import { getActivity } from '../../services/activity.ts';
import { SYSTEM_ID } from '../../utils/constants/application.ts';
import { getLogger } from '../../utils/log.ts';
import { uuidToActivityId } from '../../utils/utils.ts';

import type { PrismaTransactionClient } from '../../db/dataConnection.ts';
import type { CurrentContext } from '../../types/index.ts';

const log = getLogger(module.filename);

/**
 * Checks the health of the database by executing a simple query.
 * @returns A promise that resolves to `true` if the database is healthy, or
 * `false` if the health check fails.
 * Will log an error and return `false` if the database is not healthy.
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
 * Will log an error and return `false` if the database introspection fails.
 */
export function checkDatabaseSchema(): boolean {
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
      'general_project',
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
  const tables = new Set(Prisma.dmmf.datamodel.models.map((x) => x.dbName ?? x.name));
  const matches = {
    schemas: expected.schemas.every((t) => schemas.has(t)),
    tables: expected.tables.every((t) => tables.has(t))
  };

  log.debug('Database schema introspection', { matches });
  return matches.tables;
}

/**
 * Generates DB create stamps
 * @param currentContext The current context of the Express request
 * @returns An object with filled create stamps
 */
export function generateCreateStamps(currentContext: CurrentContext | undefined) {
  return {
    createdBy: currentContext?.userId ?? SYSTEM_ID,
    createdAt: new Date()
  };
}

/**
 * Generates DB update stamps
 * @param currentContext The current context of the Express request
 * @returns An object with filled update stamps
 */
export function generateUpdateStamps(currentContext: CurrentContext | undefined) {
  return {
    updatedBy: currentContext?.userId ?? SYSTEM_ID,
    updatedAt: new Date()
  };
}

/**
 * Generates null DB update stamps
 * @returns An object with null update stamps
 */
export function generateNullUpdateStamps() {
  return {
    updatedBy: null,
    updatedAt: null
  };
}

export function generateDeleteStamps(currentContext: CurrentContext | undefined) {
  return {
    deletedBy: currentContext?.userId ?? SYSTEM_ID,
    deletedAt: new Date()
  };
}

export function generateNullDeleteStamps() {
  return {
    deletedBy: null,
    deletedAt: null
  };
}

/**
 * Generate a new activityId, which are truncated UUIDs
 * If a collision is detected, generate new UUID and test again
 * @param tx Prisma transaction client
 * @returns A string in title case
 */
export async function generateUniqueActivityId(tx: PrismaTransactionClient): Promise<string> {
  let id, queryResult;

  do {
    id = uuidToActivityId(uuidv4());
    queryResult = await getActivity(tx, id);
  } while (queryResult);

  return id;
}

export function jsonToPrismaInputJson(json: Prisma.JsonValue): Prisma.NullTypes.JsonNull | Prisma.InputJsonValue {
  if (json === null) return null as unknown as Prisma.JsonNullValueInput;
  return json as Prisma.InputJsonValue;
}

/**
 * Create Audit Log Trigger for a given table
 * @param knex Knex instance
 * @param schema Schema
 * @param table Table
 */
export async function createAuditLogTrigger(knex: Knex, schema: string, table: string): Promise<void> {
  await knex.schema.raw(`CREATE TRIGGER audit_${table}_trigger
    AFTER UPDATE OR DELETE ON ${schema}.${table}
    FOR EACH ROW EXECUTE PROCEDURE audit.if_modified_func();`);
}

/**
 * Create an updated at trigger for a given table
 * @param knex Knex instance
 * @param schema Schema
 * @param table Table
 */
export async function createUpdatedAtTrigger(knex: Knex, schema: string, table: string): Promise<void> {
  await knex.schema.raw(`CREATE TRIGGER before_update_${table}_trigger
    BEFORE UPDATE ON ${schema}.${table}
    FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();`);
}

/**
 * Drop Audit Log Trigger for a given table
 * @param knex Knex instance
 * @param schema Schema
 * @param table Table
 * @returns Query Builder Promise
 */
export async function dropAuditLogTrigger(knex: Knex, schema: string, table: string): Promise<void> {
  await knex.schema.raw(`DROP TRIGGER IF EXISTS audit_${table}_trigger ON ${schema}.${table}`);
}

/**
 * Drop an updated at trigger for a given table
 * @param knex Knex instance
 * @param schema Schema
 * @param table Table
 * @returns Query Builder Result
 */
export async function dropUpdatedAtTrigger(knex: Knex, schema: string, table: string): Promise<void> {
  await knex.schema.raw(`DROP TRIGGER IF EXISTS before_update_${table}_trigger ON ${schema}.${table}`);
}
