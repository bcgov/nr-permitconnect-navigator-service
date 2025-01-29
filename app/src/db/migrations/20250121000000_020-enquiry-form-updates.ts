/* eslint-disable max-len */
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    knex.schema.alterTable('enquiry', (table) => {
      table.dropColumn('is_related');
    })
  );
}

export async function down(knex: Knex): Promise<void> {
  return Promise.resolve()

    .then(() =>
      knex.schema.alterTable('enquiry', (table) => {
        table.text('is_related');
      })
    );
}
