import { PrismaPg } from '@prisma/adapter-pg';
import config from 'config';

import { PrismaClient } from '#prismaClient';
import filterDeletedTransform from './extensions/filterDeleted.ts';
import numericTransform from './extensions/numeric.ts';
import permitStatusDatesTransform from './extensions/permitStatusDates.ts';
import projectIdTransform from './extensions/projectId.ts';
import { getLogger } from '#src/utils/log';

const log = getLogger(module.filename);

const db = {
  host: config.get<string>('server.db.host'),
  user: config.get<string>('server.db.username'),
  password: encodeURIComponent(config.get<string>('server.db.password')),
  database: config.get<string>('server.db.database'),
  port: config.get<string>('server.db.port'),
  poolMax: config.get<string>('server.db.poolMax')
};

const datasourceUrl = `postgresql://${db.user}:${db.password}@${db.host}:${db.port}/${db.database}?&connection_limit=${db.poolMax}`;

const adapter = new PrismaPg({ connectionString: datasourceUrl });

// Note: These two types are a workaround for using Prisma's TransactionClient type while also extending the client.
// The interface is necessary for function args to not show an expanded type
// see - https://github.com/prisma/prisma/issues/20738
export type ExtendedClient = typeof prisma;
type _PrismaTransactionClient = Parameters<Parameters<ExtendedClient['$transaction']>[0]>[0];
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PrismaTransactionClient extends _PrismaTransactionClient {}

const prisma = new PrismaClient({
  // TODO: https://www.prisma.io/docs/orm/prisma-client/observability-and-logging/logging#event-based-logging
  log: ['error', 'warn'],
  errorFormat: 'pretty',
  adapter
})
  .$extends(permitStatusDatesTransform)
  .$extends(filterDeletedTransform)
  .$extends(numericTransform)
  .$extends(projectIdTransform);

export default prisma;
export type PrismaClientType = typeof prisma;

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
