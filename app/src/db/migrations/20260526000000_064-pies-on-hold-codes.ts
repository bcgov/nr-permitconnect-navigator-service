import {
  createAuditLogTrigger,
  createStamps,
  createUpdatedAtTrigger,
  dropAuditLogTrigger,
  dropUpdatedAtTrigger
} from '../utils/utils.ts';

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Create code tables
      .then(() =>
        knex.schema.createTable('pies_on_hold_code', (table) => {
          // Constrains to SCREAMING_SNAKE w/ no double or trailing underscores
          table.text('code').primary().checkRegex('^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$');
          table.text('display').unique().notNullable();
          table.text('definition').notNullable();
          table.boolean('active').notNullable().defaultTo(true);
          createStamps(knex, table);
        })
      )

      // Create before update & audit triggers
      .then(async () => await createUpdatedAtTrigger(knex, 'public', 'pies_on_hold_code'))
      .then(async () => await createAuditLogTrigger(knex, 'public', 'pies_on_hold_code'))

      // Seeding code table
      .then(() => {
        const onHoldCodes = [
          {
            code: 'APPLICANT_REQUEST',
            display: 'Applicant Request',
            definition: 'The application is paused as requested by applicant and supported by staff.'
          },
          {
            code: 'LEGAL_ACTION',
            display: 'Legal Action',
            definition:
              'The application is subject to legal proceedings, or legal counsel has advised that processing be paused.'
          },
          {
            code: 'MISSING_INFORMATION',
            display: 'Missing Information',
            definition: 'More information is required from the applicant to proceed with the review.'
          },
          {
            code: 'PENDING_EXTERNAL_DECISION',
            display: 'Pending External Decision',
            definition:
              'The application requires decision, approval, or input from another agency or an external process.'
          }
        ];

        return knex('pies_on_hold_code').insert(onHoldCodes);
      })

      // Add on_hold_code to permit table
      .then(() =>
        knex.schema.alterTable('permit', function (table) {
          table
            .text('on_hold_code')
            .references('code')
            .inTable('pies_on_hold_code')
            .onUpdate('CASCADE')
            .onDelete('SET NULL');
        })
      )

      // Set on_hold_code to MISSING_INFORMATION for PEACH integrated permits in 'Pending client action' state
      .then(() => {
        const peachIntegratedPermitTypes = [32, 34, 35, 8, 9, 11, 12, 10, 7, 31, 21, 19, 20, 22, 23];

        return knex('permit')
          .where('state', 'PENDING_APPLICANT_ACTION')
          .whereIn('permit_type_id', peachIntegratedPermitTypes)
          .update({
            on_hold_code: 'MISSING_INFORMATION'
          });
      })
  );
}

export async function down(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Drop on_hold_code column
      .then(() =>
        knex.schema.alterTable('permit', function (table) {
          table.dropColumn('on_hold_code');
        })
      )

      // Drop triggers
      .then(async () => await dropUpdatedAtTrigger(knex, 'public', 'pies_on_hold_code'))
      .then(async () => await dropAuditLogTrigger(knex, 'public', 'pies_on_hold_code'))

      // Drop code table
      .then(() => knex.schema.dropTableIfExists('pies_on_hold_code'))
  );
}
