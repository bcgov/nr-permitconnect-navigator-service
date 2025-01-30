/* eslint-disable max-len */
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    knex.schema.alterTable('enquiry', (table) => {
      table.dropColumn('apply_for_permit_connect');
    })
  );
}

export async function down(knex: Knex): Promise<void> {
  return Promise.resolve()

    .then(() =>
      knex.schema.alterTable('enquiry', (table) => {
        table.text('apply_for_permit_connect');
      })
    );
}
