import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Add company_id_registered column to electrification_project & housing_project
      .then(() =>
        knex.schema.alterTable('electrification_project', function (table) {
          table.text('company_id_registered');
        })
      )
      .then(() =>
        knex.schema.alterTable('housing_project', function (table) {
          table.text('company_id_registered');
        })
      )
  );
}

export async function down(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Remove company_id_registered column from electrification_project & housing_project
      .then(() =>
        knex.schema.alterTable('housing_project', function (table) {
          table.dropColumn('company_id_registered');
        })
      )
      .then(() =>
        knex.schema.alterTable('electrification_project', function (table) {
          table.dropColumn('company_id_registered');
        })
      )
  );
}
