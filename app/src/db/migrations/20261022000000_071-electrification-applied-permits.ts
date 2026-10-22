import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    knex.schema.alterTable('electrification_project', function (table) {
      table.text('has_applied_provincial_permits');
    })
  );
}

export async function down(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    knex.schema.alterTable('electrification_project', function (table) {
      table.dropColumns('has_applied_provincial_permits');
    })
  );
}
