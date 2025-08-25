/* eslint-disable max-len */
import stamps from '../stamps';

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Rename note to note_history
      .then(() => knex.schema.renameTable('note', 'note_history'))

      // Column adjustments
      .then(() =>
        knex.schema.alterTable('note_history', function (table) {
          table.boolean('shown_to_proponent').notNullable().defaultTo(false);
          table.boolean('escalate_to_supervisor').notNullable().defaultTo(false);
          table.boolean('escalate_to_director').notNullable().defaultTo(false);
          table.string('escalation_type');
          table.renameColumn('note_id', 'note_history_id');
          table.renameColumn('note_type', 'type');
        })
      )

      // Rename pkey constraint
      .then(() => knex.schema.raw(' ALTER TABLE public.note_history RENAME CONSTRAINT note_pkey TO note_history_pkey'))

      // Drop the old note triggers
      .then(() => knex.schema.raw('DROP TRIGGER IF EXISTS before_update_note_trigger ON public.note_history'))
      .then(() => knex.schema.raw('DROP TRIGGER IF EXISTS audit_note_trigger ON public.note_history'))

      // Create renamed note_history triggers
      .then(() =>
        knex.schema.raw(`CREATE TRIGGER before_update_note_history_trigger
          BEFORE UPDATE ON public.note_history
          FOR EACH ROW
          EXECUTE FUNCTION public.set_updated_at();`)
      )
      .then(() =>
        knex.schema.raw(`CREATE TRIGGER audit_note_history_trigger
          AFTER UPDATE OR DELETE ON public.note_history
          FOR EACH ROW
          EXECUTE PROCEDURE audit.if_modified_func();`)
      )

      // Create note table
      .then(() =>
        knex.schema.createTable('note', (table) => {
          table.uuid('note_id').primary(); // Primary key
          table
            .uuid('note_history_id')
            .notNullable()
            .references('note_history_id')
            .inTable('public.note_history')
            .onUpdate('CASCADE')
            .onDelete('CASCADE'); // Foreign key to 'permit'
          table.text('note').notNullable().defaultTo('');
          stamps(knex, table);
        })
      )

      // Add note triggers
      .then(() =>
        knex.schema.raw(`CREATE TRIGGER before_update_note_trigger
          BEFORE UPDATE ON public.note
          FOR EACH ROW
          EXECUTE FUNCTION public.set_updated_at();`)
      )
      .then(() =>
        knex.schema.raw(`CREATE TRIGGER audit_note_trigger
          AFTER UPDATE OR DELETE ON public.note
          FOR EACH ROW
          EXECUTE PROCEDURE audit.if_modified_func();`)
      )

      // Copy note data to new table
      .then(async () => {
        await knex.raw(`INSERT INTO public.note (note_id, note_history_id, note)
            SELECT uuid_in(overlay(overlay(md5(random()::text || ':' || random()::text) placing '4' from 13) placing to_hex(floor(random()*(11-8+1) + 8)::int)::text from 17)::cstring),
            note_history_id,
            note
            FROM public.note_history;`);
      })

      // Drop note column from note_history
      .then(() =>
        knex.schema.alterTable('note_history', function (table) {
          table.dropColumn('note');
        })
      )
  );
}

export async function down(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Add note column back to note_history
      .then(() =>
        knex.schema.alterTable('note_history', function (table) {
          table.text('note').notNullable().defaultTo('');
        })
      )

      // Copy note data back
      .then(async () => {
        await knex.raw(`UPDATE public.note_history AS nh
          set note = n.note
          FROM public.note n
          WHERE nh.note_history_id = n.note_history_id;`);
      })

      // Drop note triggers
      .then(() => knex.schema.raw('DROP TRIGGER IF EXISTS audit_note_trigger ON note'))
      .then(() => knex.schema.raw('DROP TRIGGER IF EXISTS before_update_note_trigger ON note'))

      // Drop note table
      .then(() => knex.schema.dropTableIfExists('note'))

      // Column adjustments
      .then(() =>
        knex.schema.alterTable('note_history', function (table) {
          table.renameColumn('type', 'note_type');
          table.renameColumn('note_history_id', 'note_id');
          table.dropColumn('escalation_type');
          table.dropColumn('escalate_to_director');
          table.dropColumn('escalate_to_supervisor');
          table.dropColumn('shown_to_proponent');
        })
      )

      // Rename pkey constraint
      .then(() => knex.schema.raw('ALTER TABLE public.note_history RENAME CONSTRAINT note_history_pkey TO note_pkey'))

      // Rename note_history back to note
      .then(() => knex.schema.renameTable('note_history', 'note'))

      // Drop the old note_history triggers
      .then(() => knex.schema.raw('DROP TRIGGER IF EXISTS before_update_note_history_trigger ON public.note'))
      .then(() => knex.schema.raw('DROP TRIGGER IF EXISTS audit_note_history_trigger ON public.note'))

      // Create renamed note triggers
      .then(() =>
        knex.schema.raw(`CREATE TRIGGER before_update_note_trigger
          BEFORE UPDATE ON public.note
          FOR EACH ROW
          EXECUTE FUNCTION public.set_updated_at();`)
      )
      .then(() =>
        knex.schema.raw(`CREATE TRIGGER audit_note_trigger
          AFTER UPDATE OR DELETE ON public.note
          FOR EACH ROW
          EXECUTE PROCEDURE audit.if_modified_func();`)
      )
  );
}
