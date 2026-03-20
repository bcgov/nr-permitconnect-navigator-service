import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Update permit types
      .then(() =>
        knex('permit_type').where('branch', 'Archaeology').update({
          info_url: 'https://www2.gov.bc.ca/gov/content/industry/natural-resource-use/archaeology/assessments-studies'
        })
      )
      .then(() =>
        knex('permit_type').where('type', 'Waste Discharge Permit').update({
          info_url:
            'https://www2.gov.bc.ca/gov/content/environment/waste-management/waste-discharge-authorization/apply'
        })
      )
  );
}

export async function down(knex: Knex): Promise<void> {
  return Promise.resolve()
    .then(() =>
      knex('permit_type').where('type', 'Waste Discharge Permit').update({
        info_url: null
      })
    )
    .then(() =>
      knex('permit_type').where('branch', 'Archaeology').update({
        info_url: 'https://www2.gov.bc.ca/gov/content/industry/natural-resource-use/archaeology/permits'
      })
    );
}
