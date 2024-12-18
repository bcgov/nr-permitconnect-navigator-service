/* eslint-disable max-len */
import stamps from '../stamps';

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    // Create public schema tables
    knex.schema
      .createTable('email_log', (table) => {
        table.uuid('email_log_id').primary();
        table.integer('http_status').defaultTo(null);
        table.uuid('msg_id').defaultTo(null);
        table.text('to').defaultTo(null);
        table.uuid('tx_id').defaultTo(null);
        stamps(knex, table);
      })

      // Create before update triggers
      .then(() =>
        knex.schema.raw(`CREATE TRIGGER before_update_email_log_trigger
          BEFORE UPDATE ON email_log
          FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();`)
      )

      // Create audit triggers
      .then(() =>
        knex.schema.raw(`CREATE TRIGGER audit_email_log_trigger
          AFTER UPDATE OR DELETE ON email_log
          FOR EACH ROW EXECUTE PROCEDURE audit.if_modified_func();`)
      )
  );
}

export async function down(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Drop audit triggers
      .then(() => knex.schema.raw('DROP TRIGGER IF EXISTS audit_email_log_trigger ON email_log'))

      // Drop public schema table triggers
      .then(() => knex.schema.raw('DROP TRIGGER IF EXISTS before_update_email_log_trigger ON email_log'))

      // Drop public schema tables
      .then(() => knex.schema.dropTableIfExists('email_log'))
  );
}
