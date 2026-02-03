import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Drop is_developed_in_bc column from housing_project
      .then(() =>
        knex.schema.alterTable('housing_project', function (table) {
          table.dropColumn('is_developed_in_bc');
        })
      )
  );
}

export async function down(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Add is_developed_in_bc column to housing_project
      .then(() =>
        knex.schema.alterTable('housing_project', function (table) {
          table.text('is_developed_in_bc');
        })
      )
  );
}
