import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Update electrification project category code
      .then(() =>
        knex('electrification_project_category_code').where('code', 'HYDRO_INTERCONNECT').update({
          code: 'INTERCONNECTIVITY',
          display: 'Interconnectivity',
          definition: 'Projects to upgrade existing electric infrastructure connected to renewable energy projects'
        })
      )
  );
}

export async function down(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    knex('electrification_project_category_code').where('code', 'INTERCONNECTIVITY').update({
      code: 'HYDRO_INTERCONNECT',
      display: 'BC Hydro Interconnectivity',
      definition: 'Projects to connect new generation or large loads to the provincial power grid'
    })
  );
}
