import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    knex.schema.alterTable('permit', function (table) {
      table.date('consultation_start_date');
      table.specificType('consultation_start_time', 'timetz(6)');
      table.date('consultation_end_date');
      table.specificType('consultation_end_time', 'timetz(6)');
    })
  );
}

export async function down(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    knex.schema.alterTable('permit', function (table) {
      table.dropColumn('consultation_end_time');
      table.dropColumn('consultation_end_date');
      table.dropColumn('consultation_start_time');
      table.dropColumn('consultation_start_date');
    })
  );
}
