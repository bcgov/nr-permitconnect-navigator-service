/* eslint-disable max-len */
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return Promise.resolve()
    .then(() =>
      knex.schema.alterTable('enquiry', (table) => {
        table.integer('ats_client_id').comment('May be an integer number containing up to 38 digits');
        table.boolean('added_to_ats').notNullable().defaultTo(false);
      })
    )
    .then(() =>
      knex.schema.alterTable('submission', (table) => {
        table.integer('ats_client_number').comment('May be an integer number containing up to 38 digits').alter();
      })
    )
    .then(() =>
      knex.schema.alterTable('submission', (table) => {
        table.renameColumn('ats_client_number', 'ats_client_id');
      })
    );
}

export async function down(knex: Knex): Promise<void> {
  return Promise.resolve()
    .then(() =>
      knex.schema.alterTable('submission', (table) => {
        table.renameColumn('ats_client_id', 'ats_client_number');
      })
    )
    .then(() =>
      knex.schema.alterTable('submission', (table) => {
        table.text('ats_client_number').alter();
      })
    )
    .then(() =>
      knex.schema.alterTable('enquiry', (table) => {
        table.dropColumn('added_to_ats');
        table.dropColumn('ats_client_id');
      })
    );
}
