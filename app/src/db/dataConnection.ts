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
  }).$extends({
    query: {
      electrification_project: {
        create({ args, query }) {
          args.data.submittedAt = new Date(args.data.submittedAt ?? Date.now());
          args.data.createdAt = args.data.createdAt ? new Date(args.data.createdAt) : null;
          return query(args);
        },
        update({ args, query }) {
          args.data.submittedAt =
            args.data.submittedAt instanceof String ? new Date(args.data.submittedAt as string) : args.data.submittedAt;

          args.data.updatedAt =
            args.data.updatedAt instanceof String ? new Date(args.data.updatedAt as string) : args.data.updatedAt;
          return query(args);
        }
        // upsert({ args, query }) {
        //   if (args.create) {
        //     args.create.createdAt = args.create.createdAt ? new Date(args.create.createdAt) : null;
        //   }

        //   if (args.update) {
        //     args.update.updatedAt =
        //       args.update.updatedAt instanceof String
        //         ? new Date(args.update.updatedAt as string)
        //         : args.update.updatedAt;
        //   }
        //   return query(args);
        // }
      }
    },
    result: {
      electrification_project: {
        submittedAt: {
          needs: { submittedAt: true },
          compute(data: { submittedAt: Date }) {
            return new Date(data.submittedAt).toISOString();
          }
        },
        createdAt: {
          needs: { createdAt: true },
          compute(data: { createdAt: Date }) {
            return new Date(data.createdAt).toISOString();
          }
        },
        updatedAt: {
          needs: { updatedAt: true },
          compute(data: { updatedAt: Date }) {
            return data.updatedAt ? new Date(data.updatedAt).toISOString() : null;
          }
        }
      }
    }
  }) as any; // eslint-disable-line
}

export default prisma;
