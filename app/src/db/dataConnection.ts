import config from 'config';
import { PrismaClient } from '@prisma/client';

import { dateTimeIsoTransform, numericTransform, projectIdAlias } from './extensions';

// let prisma: PrismaClient;

const db = {
  host: config.get('server.db.host'),
  user: config.get('server.db.username'),
  password: config.get('server.db.password'),
  database: config.get('server.db.database'),
  port: config.get('server.db.port'),
  poolMax: config.get('server.db.poolMax')
};

// TODO: Why the !prisma check? If needed revert back to the original code
// Note: With old code we lose the ability to have type safety with results in extensions
// if (!prisma) {
const datasourceUrl = `postgresql://${db.user}:${db.password}@${db.host}:${db.port}/${db.database}?&connection_limit=${db.poolMax}`;
const prisma = new PrismaClient({
  // TODO: https://www.prisma.io/docs/orm/prisma-client/observability-and-logging/logging#event-based-logging
  log: ['error', 'warn'],
  errorFormat: 'pretty',
  datasourceUrl: datasourceUrl
})
  .$extends(dateTimeIsoTransform)
  .$extends(numericTransform)
  .$extends(projectIdAlias);
//    .$extends(projectIdAlias) as any; // eslint-disable-line
// }

// }

export default prisma;
