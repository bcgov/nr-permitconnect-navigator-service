import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    knex.schema.alterTable('activity', function (table) {
      table.boolean('is_deleted').notNullable().defaultTo(false);
    })
  );
}

export async function down(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    knex.schema.alterTable('activity', function (table) {
      table.dropColumn('is_deleted');
    })
  );
}
