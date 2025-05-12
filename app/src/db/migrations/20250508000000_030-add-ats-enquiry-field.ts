import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return Promise.resolve()
    .then(() =>
      knex.schema.alterTable('submission', (table) => {
        table.integer('ats_enquiry_id');
      })
    )
    .then(() =>
      knex.schema.alterTable('enquiry', (table) => {
        table.integer('ats_enquiry_id');
      })
    );
}

export async function down(knex: Knex): Promise<void> {
  return Promise.resolve()

    .then(() =>
      knex.schema.alterTable('submission', (table) => {
        table.dropColumn('ats_enquiry_id');
      })
    )
    .then(() =>
      knex.schema.alterTable('enquiry', (table) => {
        table.dropColumn('ats_enquiry_id');
      })
    );
}
