/* eslint-disable max-len */
import stamps from '../stamps';

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Create code table
      .then(() =>
        knex.schema.createTable('escalation_type_code', (table) => {
          table.text('code').primary().checkRegex('^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$'); // Constrains to SCREAMING_SNAKE w/ no double or trailing underscores
          table.text('display').unique().notNullable();
          table.text('definition').notNullable();
          table.boolean('active').notNullable().defaultTo(true);
          stamps(knex, table);
        })
      )

      // Create escalation_type_code triggers
      .then(() =>
        knex.schema.raw(`CREATE TRIGGER before_update_escalation_type_code_trigger
          BEFORE UPDATE ON public.escalation_type_code
          FOR EACH ROW
          EXECUTE FUNCTION public.set_updated_at();`)
      )
      .then(() =>
        knex.schema.raw(`CREATE TRIGGER audit_escalation_type_code_trigger
          AFTER UPDATE OR DELETE ON public.escalation_type_code
          FOR EACH ROW
          EXECUTE PROCEDURE audit.if_modified_func();`)
      )

      // Seeding code table
      .then(() => {
        const types = [
          {
            code: 'PROPONENT',
            display: 'Proponent related',
            definition: 'Escalated for a proponent reason.'
          },
          {
            code: 'MINISTRY',
            display: 'Ministry Related',
            definition: 'Escalated for a ministry related reason.'
          },
          {
            code: 'TIME_SENSITIVE',
            display: 'Time-sensitive',
            definition: 'Escalated for a time sensitive reason.'
          },
          {
            code: 'OTHER',
            display: 'Other',
            definition: 'Any other escalation type.'
          }
        ];
        return knex('escalation_type_code').insert(types);
      })

      // Column adjustments
      .then(() =>
        knex.schema.alterTable('note_history', function (table) {
          table
            .text('escalation_type') // Nullable for nav project creation
            .references('code')
            .inTable('escalation_type_code')
            .onUpdate('CASCADE')
            .onDelete('SET NULL')
            .alter();
        })
      )
  );
}

export async function down(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Revert column adjustments
      .then(() =>
        knex.schema.alterTable('note_history', function (table) {
          table.string('escalation_type').alter();
        })
      )

      // Drop code table triggers
      .then(() => knex.schema.raw('DROP TRIGGER IF EXISTS before_update_escalation_type_code_trigger ON public.note'))
      .then(() => knex.schema.raw('DROP TRIGGER IF EXISTS audit_escalation_type_code_trigger ON public.note'))

      // Drop code table
      .then(() => knex.schema.dropTableIfExists('escalation_type_code'))
  );
}
