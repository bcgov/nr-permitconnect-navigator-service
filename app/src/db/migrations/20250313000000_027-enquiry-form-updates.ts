/* eslint-disable max-len */
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    knex.schema.alterTable('enquiry', function (table) {
      table
        .enu('submitted_method', ['Email', 'Phone', 'PCNS'], {
          useNative: true,
          enumName: 'enquiry_submitted_method_enum'
        })
        .defaultTo('PCNS')
        .notNullable();
    })
  );
}

export async function down(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    knex.schema
      .alterTable('enquiry', function (table) {
        table.dropColumn('submitted_method');
      })
      // Drop the access_request_status_enum type
      .then(() => knex.schema.raw('DROP TYPE IF EXISTS enquiry_submitted_method_enum'))
  );
}
