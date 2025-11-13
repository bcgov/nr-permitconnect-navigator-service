/* eslint-disable max-len */
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      .then(() =>
        knex.schema.alterTable('activity_contact', function (table) {
          table
            .enu('role', ['PRIMARY', 'ADMIN', 'MEMBER'], {
              useNative: true,
              enumName: 'activity_contact_role_enum'
            })
            .defaultTo('MEMBER')
            .notNullable();
        })
      )

      // Set every existing activity_contact to PRIMARY as they are all the creators at this point
      .then(() => knex('activity_contact').update({ role: 'PRIMARY' }))
  );
}

export async function down(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    knex.schema
      .alterTable('activity_contact', function (table) {
        table.dropColumn('role');
      })

      // Drop the activity_contact_role_enum type
      .then(() => knex.schema.raw('DROP TYPE IF EXISTS activity_contact_role_enum'))
  );
}
