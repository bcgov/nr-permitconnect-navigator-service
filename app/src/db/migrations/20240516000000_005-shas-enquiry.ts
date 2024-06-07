import stamps from '../stamps';

import type { Knex } from 'knex';

/*
 * Not included in this migration is a manual destructive operation
 * submission.contact_name will be split into two new parts
 * submission.contact_first_name
 * submission.contact_last_name
 * submission.contact_name will then be dropped
 */

export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Create public schema tables
      .then(() =>
        knex.schema.createTable('enquiry', (table) => {
          table.uuid('enquiry_id').primary();
          table
            .text('activity_id')
            .notNullable()
            .references('activity_id')
            .inTable('activity')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
          table.uuid('assigned_user_id').references('user_id').inTable('user').onUpdate('CASCADE').onDelete('CASCADE');
          table.timestamp('submitted_at', { useTz: true }).notNullable();
          table.text('submitted_by').notNullable();
          table.text('contact_first_name');
          table.text('contact_last_name');
          table.text('contact_phone_number');
          table.text('contact_email');
          table.text('contact_preference');
          table.text('contact_applicant_relationship');
          table.text('is_related');
          table.text('related_activity_id');
          table.text('enquiry_description');
          table.text('apply_for_permit_connect');
          table.text('intake_status');
          stamps(knex, table);
        })
      )

      .then(() =>
        knex.schema.alterTable('submission', (table) => {
          table.text('contact_first_name');
          table.text('contact_last_name');
        })
      )

      // Create public schema table triggers
      .then(() =>
        knex.schema.raw(`create trigger before_update_enquiry_trigger
      before update on "enquiry"
      for each row execute procedure public.set_updated_at();`)
      )

      // Create audit triggers
      .then(() =>
        knex.schema.raw(`CREATE TRIGGER audit_enquiry_trigger
        AFTER UPDATE OR DELETE ON enquiry
        FOR EACH ROW EXECUTE PROCEDURE audit.if_modified_func();`)
      )
  );
}

export async function down(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Drop audit triggers
      .then(() => knex.schema.raw('DROP TRIGGER IF EXISTS audit_enquiry_trigger ON permit'))

      // Drop public schema table triggers
      .then(() => knex.schema.raw('DROP TRIGGER IF EXISTS before_update_enquiry_trigger ON "enquiry"'))

      .then(() =>
        knex.schema.alterTable('submission', function (table) {
          table.dropColumn('contact_last_name');
          table.dropColumn('contact_first_name');
        })
      )

      // Drop public schema tables
      .then(() => knex.schema.dropTableIfExists('enquiry'))
  );
}
