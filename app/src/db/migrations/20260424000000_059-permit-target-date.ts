import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    knex.schema.alterTable('permit', function (table) {
      table.date('target_date');
      table.text('target_date_description');
    })
  );
}

export async function down(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    knex.schema.alterTable('permit', function (table) {
      table.dropColumns('target_date', 'target_date_description');
    })
  );
}
