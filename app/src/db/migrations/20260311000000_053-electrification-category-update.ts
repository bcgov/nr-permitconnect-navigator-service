import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Add new electrification project category code
      .then(() =>
        knex('electrification_project_category_code').insert({
          code: 'HYDRO_INTERCONNECT',
          display: 'BC Hydro Interconnectivity',
          definition: 'Projects to connect new generation or large loads to the provincial power grid',
          active: true
        })
      )
  );
}

export async function down(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    knex('electrification_project_category_code').where('code', 'HYDRO_INTERCONNECT').del()
  );
}
