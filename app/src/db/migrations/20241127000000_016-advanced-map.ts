/* eslint-disable max-len */
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return Promise.resolve()
    .then(() =>
      knex.schema.alterTable('submission', function (table) {
        table.json('geo_json');
      })
    )
    .then(() =>
      knex.schema.alterTable('submission', function (table) {
        table.text('location_pids_auto');
      })
    );
}

export async function down(knex: Knex): Promise<void> {
  return Promise.resolve() // Drop public schema tables
    .then(() =>
      knex.schema.alterTable('submission', function (table) {
        table.dropColumn('geo_json');
      })
    )
    .then(() =>
      knex.schema.alterTable('submission', function (table) {
        table.dropColumn('location_pids_auto');
      })
    );
}
