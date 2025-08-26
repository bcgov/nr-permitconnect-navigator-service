import config from 'config';
import { PrismaClient } from '@prisma/client';

import filterDeletedTransform from './extensions/filterDeleted';
import numericTransform from './extensions/numeric';
import projectIdTransform from './extensions/projectId';

const db = {
  host: config.get('server.db.host'),
  user: config.get('server.db.username'),
  password: config.get('server.db.password'),
  database: config.get('server.db.database'),
  port: config.get('server.db.port'),
  poolMax: config.get('server.db.poolMax')
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
  .$extends(filterDeletedTransform)
  .$extends(numericTransform)
  .$extends(projectIdTransform);

export default prisma;
