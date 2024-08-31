/* eslint-disable max-len */
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Find all duplicated user entries in "user" table (by querying by "identity_id")
      // Then delete the most recent duplicated entry
      .then(() =>
        knex.raw(`DELETE FROM "public"."user" AS u
        WHERE u."user_id" IN (
          SELECT DISTINCT ON ("public"."user"."identity_id") "public"."user"."user_id"
          FROM "public"."user"
          WHERE (
            SELECT count(*)
            FROM "public"."user" AS user2
            WHERE user2."identity_id" = "public"."user"."identity_id") > 1
          ORDER BY "public"."user"."identity_id", "public"."user"."created_at" DESC
        )`)
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
