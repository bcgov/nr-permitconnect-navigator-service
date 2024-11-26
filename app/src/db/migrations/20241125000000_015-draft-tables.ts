/* eslint-disable max-len */
import stamps from '../stamps';

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    // Create public schema tables
    knex.schema
      .createTable('draft_code', (table) => {
        table.text('draft_code').primary();
        stamps(knex, table);
      })

      .createTable('draft', (table) => {
        table.uuid('draft_id').primary();
        table
          .text('activity_id')
          .notNullable()
          .references('activity_id')
          .inTable('activity')
          .onUpdate('CASCADE')
          .onDelete('CASCADE');
        table
          .text('draft_code')
          .notNullable()
          .references('draft_code')
          .inTable('draft_code')
          .onUpdate('CASCADE')
          .onDelete('CASCADE');
        table.json('data').notNullable();
        stamps(knex, table);
      })

      // Create before update triggers
      .then(() =>
        knex.schema.raw(`CREATE TRIGGER before_update_draft_code_trigger
          BEFORE UPDATE ON draft_code
          FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();`)
      )

      .then(() =>
        knex.schema.raw(`CREATE TRIGGER before_update_draft_trigger
          BEFORE UPDATE ON draft
          FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();`)
      )

      // Create audit triggers
      .then(() =>
        knex.schema.raw(`CREATE TRIGGER audit_draft_code_trigger
          AFTER UPDATE OR DELETE ON draft_code
          FOR EACH ROW EXECUTE PROCEDURE audit.if_modified_func();`)
      )

      .then(() =>
        knex.schema.raw(`CREATE TRIGGER audit_draft_trigger
          AFTER UPDATE OR DELETE ON draft
          FOR EACH ROW EXECUTE PROCEDURE audit.if_modified_func();`)
      )

      // Populate Baseline Data
      .then(() => {
        const items = [
          {
            draft_code: 'SUBMISSION'
          }
        ];
        return knex('draft_code').insert(items);
      })
  );
}

export async function down(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Drop audit triggers
      .then(() => knex.schema.raw('DROP TRIGGER IF EXISTS audit_draft_trigger ON draft'))
      .then(() => knex.schema.raw('DROP TRIGGER IF EXISTS audit_draft_code_trigger ON draft_code'))

      // Drop public schema table triggers
      .then(() => knex.schema.raw('DROP TRIGGER IF EXISTS before_update_draft_trigger ON draft'))
      .then(() => knex.schema.raw('DROP TRIGGER IF EXISTS before_update_draft_code_trigger ON draft_code'))

      // Drop public schema tables
      .then(() => knex.schema.dropTableIfExists('draft'))
      .then(() => knex.schema.dropTableIfExists('draft_code'))
  );
}
