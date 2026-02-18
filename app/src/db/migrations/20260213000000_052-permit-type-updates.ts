import { Initiative } from '../../utils/enums/application.ts';

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Update the name of the permit type and add the source system reference
      .then(() =>
        knex('permit_type').where('name', 'Waste Discharge Permit').update({
          name: 'Authorization to Discharge Waste',
          source_system: 'ITSM-5528'
        })
      )
      // Associate the updated permit type with the Housing initiative
      .then(() => {
        const housing_id = knex('initiative')
          .where({
            code: Initiative.HOUSING
          })
          .select('initiative_id');

        const permit_type_id = knex('permit_type')
          .where({
            name: 'Authorization to Discharge Waste'
          })
          .select('permit_type_id');

        return knex('permit_type_initiative_xref').insert({
          permit_type_id: permit_type_id,
          initiative_id: housing_id
        });
      })
  );
}

export async function down(knex: Knex): Promise<void> {
  return Promise.resolve()
    .then(() => {
      const housing_id = knex('initiative')
        .where({
          code: Initiative.HOUSING
        })
        .select('initiative_id');

      const permit_type_id = knex('permit_type')
        .where({
          name: 'Authorization to Discharge Waste'
        })
        .select('permit_type_id');

      return knex('permit_type_initiative_xref')
        .where({
          permit_type_id: permit_type_id,
          initiative_id: housing_id
        })
        .del();
    })
    .then(() =>
      knex('permit_type').where('name', 'Authorization to Discharge Waste').update({
        name: 'Waste Discharge Permit',
        source_system: null
      })
    );
}
