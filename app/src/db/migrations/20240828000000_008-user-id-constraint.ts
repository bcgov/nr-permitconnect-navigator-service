/* eslint-disable max-len */
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Drop public schema functions
      .then(() =>
        knex.raw(`DELETE FROM "public"."user" AS u
        WHERE u."userId" IN (
          SELECT DISTINCT ON ("public"."user"."identityId") "public"."user"."userId"
          FROM "public"."user"
          WHERE (
            SELECT count(*)
            FROM "public"."user" AS user2
            WHERE user2."identityId" = "public"."user"."identityId") > 1
          ORDER BY "public"."user"."identityId", "public"."user"."createdAt" DESC
        )`)
      )

      // prevent further duplicate users - add unique index over columns identityId and idp in user table
      .then(() =>
        knex.schema.alterTable('user', (table) => {
          table.unique(['identityId', 'idp']);
        })
      )
  );
}

export async function down(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    knex.schema.alterTable('user', (table) => {
      table.dropUnique(['identityId', 'idp']);
    })
  );
}
