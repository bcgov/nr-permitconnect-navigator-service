import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    knex.schema.alterTable('user', (table) => {
      table.text('bceid_business_name');
    })
  );
}

export async function down(knex: Knex): Promise<void> {
  return Promise.resolve()

    .then(() =>
      knex.schema.alterTable('user', (table) => {
        table.dropColumn('bceid_business_name');
      })
    );
}
