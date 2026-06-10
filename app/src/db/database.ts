import config from 'config';
import { Prisma, PrismaClient } from '@prisma/client';

import permitStatusDatesTransform from './extensions/permitStatusDates.ts';
import filterDeletedTransform from './extensions/filterDeleted.ts';
import numericTransform from './extensions/numeric.ts';
import projectIdTransform from './extensions/projectId.ts';
import { getLogger } from '../utils/log.ts';

const log = getLogger(module.filename);

const db = {
  host: config.get<string>('server.db.host'),
  user: config.get<string>('server.db.username'),
  password: config.get<string>('server.db.password'),
  database: config.get<string>('server.db.database'),
  port: config.get<string>('server.db.port'),
  poolMax: config.get<string>('server.db.poolMax')
};

const datasourceUrl = `postgresql://${db.user}:${db.password}@${db.host}:${db.port}/${db.database}?&connection_limit=${db.poolMax}`;

// Note: These two types are a workaround for using Prisma's TransactionClient type while also extending the client.
// see - https://github.com/prisma/prisma/issues/20738
export type ExtendedClient = typeof prisma;
export type PrismaTransactionClient = Parameters<Parameters<ExtendedClient['$transaction']>[0]>[0];

const prisma = new PrismaClient({
  // TODO: https://www.prisma.io/docs/orm/prisma-client/observability-and-logging/logging#event-based-logging
  log: ['error', 'warn'],
  errorFormat: 'pretty',
  datasourceUrl: datasourceUrl
})
  .$extends(permitStatusDatesTransform)
  .$extends(filterDeletedTransform)
  .$extends(numericTransform)
  .$extends(projectIdTransform);

export default prisma;

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
