import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return Promise.resolve()
    .then(() =>
      knex.schema.alterTable('submission', function (table) {
        table.dropColumn('bring_forward_date');
      })
    )
    .then(() =>
      knex.schema.alterTable('note', function (table) {
        table.timestamp('bring_forward_date', { useTz: true });
        table.text('bring_forward_state').nullable();
      })
    );
}

export async function down(knex: Knex): Promise<void> {
  return Promise.resolve()
    .then(() =>
      knex.schema.alterTable('submission', function (table) {
        table.timestamp('bring_forward_date', { useTz: true });
      })
    )
    .then(() =>
      knex.schema.alterTable('note', function (table) {
        table.dropColumn('bring_forward_date');
        table.dropColumn('bring_forward_state');
      })
    );
}
