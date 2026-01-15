import stamps from '../stamps.ts';

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Create public schema tables
      .then(() =>
        knex.schema.createTable('permit_note', (table) => {
          table.uuid('permit_note_id').primary(); // Primary key
          table
            .uuid('permit_id')
            .notNullable()
            .references('permit_id')
            .inTable('public.permit')
            .onUpdate('CASCADE')
            .onDelete('CASCADE'); // Foreign key to 'permit'
          table.text('note').notNullable().defaultTo('');
          table.boolean('is_deleted').notNullable().defaultTo(false);
          stamps(knex, table);
        })
      )

      // Create public schema table triggers
      .then(() =>
        knex.schema.raw(`CREATE TRIGGER before_update_permit_note_trigger
          BEFORE UPDATE ON public.permit_note
          FOR EACH ROW
          EXECUTE FUNCTION public.set_updated_at();`)
      )

      // Create audit triggers
      .then(() =>
        knex.schema.raw(`CREATE TRIGGER audit_permit_note_trigger
          AFTER UPDATE OR DELETE ON public.permit_note
          FOR EACH ROW
          EXECUTE PROCEDURE audit.if_modified_func();`)
      )
  );
}

export async function down(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Drop the audit triggers
      .then(() => knex.schema.raw('DROP TRIGGER IF EXISTS audit_permit_note_trigger ON public.permit_note'))
      // Drop public schema table triggers
      .then(() => knex.schema.raw('DROP TRIGGER IF EXISTS before_update_permit_note_trigger ON public.permit_note'))
      // Drop public schema tables
      .then(() => knex.schema.dropTableIfExists('permit_note'))
  );
}
