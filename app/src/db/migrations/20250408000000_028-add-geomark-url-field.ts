import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    knex.schema.alterTable('submission', (table) => {
      table.text('geomark_url');
    })
  );
}

export async function down(knex: Knex): Promise<void> {
  return Promise.resolve()

    .then(() =>
      knex.schema.alterTable('submission', (table) => {
        table.dropColumn('geomark_url');
      })
    );
}
