import { Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

import prisma from '../../db/dataConnection';
import { getLogger } from '../../components/log';
import { activityService } from '../../services';
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

  const result = Prisma.ModelName;
  const tables = new Set(Object.keys(result));
  const matches = {
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
