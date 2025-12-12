/* eslint-disable max-len */
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // DELETE from electrification_project_category_code
      .then(() => knex('electrification_project_category_code').whereIn('code', ['POWER_2024', 'POWER_2025']).del())
  );
}

export async function down(knex: Knex): Promise<void> {
  return (
    // INSERT into electrification_project_category_code
    knex('electrification_project_category_code').insert([
      {
        code: 'POWER_2024',
        display: 'Call for Power 2024',
        definition: 'Energy projects that successfully participated in the 2024 BC Hydro "Call for Power".',
        active: true
      },
      {
        code: 'POWER_2025',
        display: 'Call for Power 2025',
        definition: 'Energy projects participating in the 2025 BC Hydro "Call for Power".',
        active: true
      }
    ])
  );
}
