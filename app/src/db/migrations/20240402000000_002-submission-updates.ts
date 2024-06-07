import { BasicResponse } from '../../utils/enums/application';

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    knex.schema.alterTable('submission', function (table) {
      table.text('contact_preference');
      table.text('contact_applicant_relationship');
      table.text('is_rental_unit').notNullable().defaultTo(BasicResponse.UNSURE);
      table.text('project_description');
    })
  );
}

export async function down(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    knex.schema.alterTable('submission', function (table) {
      table.dropColumn('project_description');
      table.dropColumn('is_rental_unit');
      table.dropColumn('contact_applicant_relationship');
      table.dropColumn('contact_preference');
    })
  );
}
