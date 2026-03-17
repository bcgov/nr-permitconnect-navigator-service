/* eslint-disable max-len */
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Add new electrification project category code
      .then(() =>
        knex('electrification_project_category_code').insert({
          code: 'CONNECTIVITY',
          display: 'Connectivity',
          definition:
            'Government-funded project to build high-speed internet infrastructure serving all households across British Columbia',
          active: true
        })
      )
  );
}

export async function down(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    knex('electrification_project_category_code').where('code', 'CONNECTIVITY').del()
  );
}
