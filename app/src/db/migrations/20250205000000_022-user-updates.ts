import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    knex.schema.alterTable('user', (table) => {
      table.dropUnique(['identity_id', 'idp']);
      table.dropColumn('identity_id');
      table.index('sub');
      table.unique('sub');
    })
  );
}

export async function down(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    knex.schema.alterTable('user', (table) => {
      table.dropUnique(['sub']);
      table.dropIndex('sub');
      table.text('identity_id');
      table.unique(['identity_id', 'idp']);
    })
  );
}
