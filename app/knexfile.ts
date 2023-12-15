import config from 'config';
import { format, parseJSON } from 'date-fns';
import { Knex } from 'knex';

import { getLogger } from './src/components/log';
const log = getLogger(module.filename);

/**
 * Knex configuration
 * Set database configuration for application and knex configuration for migrations
 * and seeding.  Since configuration values can change via env. vars or property
 * files, we only need one runtime 'environment' for knex.
 *
 * Note: it appears that the knexfile must be in the root for the config values
 * to be read correctly when running the 'npm run migrate:*' scripts.
 * @module knexfile
 * @see module:knex
 * @see module:config
 */

import { types } from 'pg';

// To handle JSON Schema validation, we treat dates and timestamps outside of the database as strings.
// Prevent the automatic conversion of dates/timestamps into Objects, leave as strings.
types.setTypeParser(1082, (value) => {
  // dates must be in the date only part of 2020-05-16T13:18:27.160Z
  return format(parseJSON(value), 'yyyy-MM-dd');
});
// timestamps...
types.setTypeParser(1114, (value) => new Date(value).toISOString());
// timestamps with zone
types.setTypeParser(1184, (value) => new Date(value).toISOString());

const logWrapper = (level: string, msg: string) => log.log(level, msg);

export const knexConfig: Knex.Config = {
  client: 'pg',
  connection: {
    host: config.get('server.db.host'),
    user: config.get('server.db.username'),
    password: config.get('server.db.password'),
    database: config.get('server.db.database'),
    port: config.get('server.db.port')
  },
  debug: ['silly', 'debug'].includes(config.get('server.logLevel')),
  log: {
    debug: (msg) => logWrapper('debug', msg),
    deprecate: (msg) => logWrapper('warn', msg),
    error: (msg) => logWrapper('error', msg),
    warn: (msg) => logWrapper('warn', msg)
  },
  migrations: {
    extension: 'ts',
    directory: './src/db/migrations'
  },
  pool: {
    min: parseInt(config.get('server.db.poolMin')),
    max: parseInt(config.get('server.db.poolMax'))
  },
  searchPath: ['public'], // Define postgres schemas to match on
  seeds: {
    directory: './src/db/seeds'
  }
};

export default knexConfig;
