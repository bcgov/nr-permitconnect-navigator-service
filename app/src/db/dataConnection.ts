import config from 'config';
import { PrismaClient } from '@prisma/client';

import { dateTimeIsoTransform, numericTransform, projectIdAlias } from './extensions';

const db = {
  host: config.get('server.db.host'),
  user: config.get('server.db.username'),
  password: config.get('server.db.password'),
  database: config.get('server.db.database'),
  port: config.get('server.db.port'),
  poolMax: config.get('server.db.poolMax')
};

const datasourceUrl = `postgresql://${db.user}:${db.password}@${db.host}:${db.port}/${db.database}?&connection_limit=${db.poolMax}`;
// TODO: Check this by try importing the client twice in one file with different aliases
// and then doing a === check against them, to see if we use the same PrismaClient instance across the app/imports
const prisma = new PrismaClient({
  // TODO: https://www.prisma.io/docs/orm/prisma-client/observability-and-logging/logging#event-based-logging
  log: ['error', 'warn'],
  errorFormat: 'pretty',
  datasourceUrl: datasourceUrl
})
  .$extends(dateTimeIsoTransform)
  .$extends(numericTransform)
  .$extends(projectIdAlias);

export default prisma;
