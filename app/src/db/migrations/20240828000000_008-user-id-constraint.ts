/* eslint-disable max-len */
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Find all duplicated user entries in "user" table (by querying by "identity_id")
      // Then delete the most recent duplicated entry
      .then(() =>
        knex.raw(`DELETE FROM "public"."user" AS u WHERE u."user_id" in
          (SELECT "user_id" from
          (SELECT "user_id", row_number() over(partition by "identity_id" order by "created_at" asc) AS row_num FROM "public"."user")s
          WHERE s.row_num>1);
        `)
      )

      // prevent further duplicate users - add unique index over columns identityId and idp in user table
      .then(() =>
        knex.schema.alterTable('user', (table) => {
          table.unique(['identity_id', 'idp']);
        })
      )
  );
}

export async function down(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    knex.schema.alterTable('user', (table) => {
      table.dropUnique(['identity_id', 'idp']);
    })
  );
}
