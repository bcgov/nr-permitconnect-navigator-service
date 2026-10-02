import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return Promise.resolve()

    .then(() =>
      knex.schema.alterTable('permit', function (table) {
        table.timestamp('consultation_start_date', { useTz: true });
        table.timestamp('consultation_end_date', { useTz: true });
      })
    );
}

export async function down(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    knex.schema.alterTable('permit', function (table) {
      table.dropColumn('consultation_start_date');
      table.dropColumn('consultation_end_date');
    })
  );
}
