import { RENTAL_STATUS_LIST } from '../../components/constants';
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    knex.schema.alterTable('submission', function (table) {
      table.text('contact_preference');
      table.text('contact_applicant_relationship');
      table.text('is_rental_unit').notNullable().defaultTo(RENTAL_STATUS_LIST.UNSURE);
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
