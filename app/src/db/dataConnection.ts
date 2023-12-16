import config from 'config';
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

const db = {
  host: config.get('server.db.host'),
  user: config.get('server.db.username'),
  password: config.get('server.db.password'),
  database: config.get('server.db.database'),
  port: config.get('server.db.port'),
  poolMax: config.get('server.db.poolMax')
};

// @ts-expect-error 2458
if (!prisma) {
  const datasourceUrl = `postgresql://${db.user}:${db.password}@${db.host}:${db.port}/${db.database}?&connection_limit=${db.poolMax}`;
  prisma = new PrismaClient({
    // TODO: https://www.prisma.io/docs/orm/prisma-client/observability-and-logging/logging#event-based-logging
    log: ['error', 'warn'],
    errorFormat: 'pretty',
    datasourceUrl: datasourceUrl
  });
}

export default prisma;
