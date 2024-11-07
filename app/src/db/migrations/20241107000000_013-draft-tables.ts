/* eslint-disable max-len */
import stamps from '../stamps';

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    // Create public schema tables
    knex.schema
      .createTable('submission_draft', (table) => {
        table.uuid('submission_draft_id').primary();
        table.json('data').notNullable();
        stamps(knex, table);
      })

      // Create before update triggers
      .then(() =>
        knex.schema.raw(`CREATE TRIGGER before_update_submission_draft_trigger
          BEFORE UPDATE ON submission_draft
          FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();`)
      )

      // Create audit triggers
      .then(() =>
        knex.schema.raw(`CREATE TRIGGER audit_submission_draft_trigger
          AFTER UPDATE OR DELETE ON submission_draft
          FOR EACH ROW EXECUTE PROCEDURE audit.if_modified_func();`)
      )
  );
}

export async function down(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Drop audit triggers
      .then(() => knex.schema.raw('DROP TRIGGER IF EXISTS audit_submission_draft_trigger ON submission_draft'))

      // Drop public schema table triggers
      .then(() => knex.schema.raw('DROP TRIGGER IF EXISTS before_update_submission_draft_trigger ON submission_draft'))

      // Drop public schema tables
      .then(() => knex.schema.dropTableIfExists('submission_draft'))
  );
}
