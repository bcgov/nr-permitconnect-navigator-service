import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    knex.schema.alterTable('permit', function (table) {
      table.text('technical_reviewer');
    })
  );
}

export async function down(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    knex.schema.alterTable('permit', function (table) {
      table.dropColumns('technical_reviewer');
    })
  );
}
