import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return Promise.resolve()
    .then(() =>
      knex.schema.alterTable('housing_project', (table) => {
        table.integer('ats_enquiry_id');
      })
    )
    .then(() =>
      knex.schema.alterTable('enquiry', (table) => {
        table.integer('ats_enquiry_id');
      })
    )
    .then(() =>
      knex.schema.alterTable('electrification_project', (table) => {
        table.integer('ats_enquiry_id');
        table.boolean('added_to_ats').notNullable().defaultTo(false);
      })
    );
}

export async function down(knex: Knex): Promise<void> {
  return Promise.resolve()
    .then(() =>
      knex.schema.alterTable('electrification_project', (table) => {
        table.dropColumn('added_to_ats');
        table.dropColumn('ats_enquiry_id');
      })
    )
    .then(() =>
      knex.schema.alterTable('enquiry', (table) => {
        table.dropColumn('ats_enquiry_id');
      })
    )
    .then(() =>
      knex.schema.alterTable('housing_project', (table) => {
        table.dropColumn('ats_enquiry_id');
      })
    );
}
