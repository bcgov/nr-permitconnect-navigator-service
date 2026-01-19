import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return Promise.resolve()
    .then(() =>
      knex.schema.alterTable('public.access_request', (table) => {
        table.renameColumn('group', 'group_id');
      })
    )

    .then(() =>
      knex.schema.alterTable('public.access_request', function (table) {
        table
          .integer('group_id')
          .notNullable()
          .references('group_id')
          .inTable('yars.group')
          .onUpdate('CASCADE')
          .onDelete('CASCADE')
          .alter();
      })
    );
}

export async function down(knex: Knex): Promise<void> {
  return Promise.resolve()
    .then(() =>
      knex.schema.alterTable('public.access_request', function (table) {
        table.dropForeign('group', 'public_access_request_group_id_foreign');
      })
    )

    .then(() =>
      knex.schema.alterTable('public.access_request', function (table) {
        table.text('group_id').alter();
      })
    )

    .then(() =>
      knex.schema.alterTable('public.access_request', (table) => {
        table.renameColumn('group_id', 'group');
      })
    );
}
