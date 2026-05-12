/* eslint-disable max-len, quotes */
import stamps from '../stamps.ts';

import {
  createAuditLogTrigger,
  createUpdatedAtTrigger,
  dropAuditLogTrigger,
  dropUpdatedAtTrigger
} from '../utils/utils.ts';

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    // Create public schema tables
    knex.schema
      .createTable('permit_state_code', (table) => {
        table.text('code').primary().checkRegex('^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$'); // Constrains to SCREAMING_SNAKE w/ no double or trailing underscores
        table.text('display').unique().notNullable();
        table.text('definition').notNullable();
        table.boolean('active').notNullable().defaultTo(true);
        stamps(knex, table);
      })

      .createTable('permit_stage_code', (table) => {
        table.text('code').primary().checkRegex('^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$'); // Constrains to SCREAMING_SNAKE w/ no double or trailing underscores
        table.text('display').unique().notNullable();
        table.text('definition').notNullable();
        table.boolean('active').notNullable().defaultTo(true);
        stamps(knex, table);
      })

      // Create before update triggers
      .then(async () => await createUpdatedAtTrigger(knex, 'public', 'permit_state_code'))
      .then(async () => await createUpdatedAtTrigger(knex, 'public', 'permit_stage_code'))

      // Create audit triggers
      .then(async () => await createAuditLogTrigger(knex, 'public', 'permit_state_code'))
      .then(async () => await createAuditLogTrigger(knex, 'public', 'permit_stage_code'))

      // Populate permit state codes
      .then(() => {
        return knex('permit_state_code').insert([
          {
            code: 'NONE',
            display: 'None',
            definition:
              'We have no information about the status yet, and it is presumed that this submission is still in draft form.'
          },
          {
            code: 'INITIAL_REVIEW',
            display: 'Initial review',
            definition: 'Your application has been received and is being reviewed for completeness.'
          },
          {
            code: 'ACCEPTED',
            display: 'Accepted',
            definition: 'The application has been accepted by the initial reviewing authority.'
          },
          {
            code: 'IN_PROGRESS',
            display: 'In progress',
            definition: 'The application is currently active.'
          },
          {
            code: 'PENDING_APPLICANT_ACTION',
            display: 'Pending applicant action',
            definition:
              "The application is currently pending the applicant's action in response to the reviewing authority's request."
          },
          {
            code: 'WITHDRAWN',
            display: 'Withdrawn by applicant',
            definition: 'The application has been withdrawn by the applicant.'
          },
          {
            code: 'CANCELLED',
            display: 'Cancelled by reviewing authority',
            definition: 'The application has been cancelled by the reviewing authority.'
          },
          {
            code: 'REJECTED',
            display: 'Rejected',
            definition: 'Your application has been rejected by the reviewing authority.'
          },
          {
            code: 'DENIED',
            display: 'Denied',
            definition:
              'The application review process is completed, however, the reviewing authority has decided to not approve the application.'
          },
          {
            code: 'APPROVED',
            display: 'Approved',
            definition: 'The application review process is completed and approved.'
          },
          {
            code: 'ISSUED',
            display: 'Issued',
            definition: 'Your permit has been issued.'
          }
        ]);
      })

      // Populate permit stage codes
      .then(() => {
        return knex('permit_stage_code').insert([
          {
            code: 'PRE_SUBMISSION',
            display: 'Pre-submission',
            definition: 'No formal submission or review is underway; the file remains entirely with the proponent.'
          },
          {
            code: 'APPLICATION_SUBMISSION',
            display: 'Application submission',
            definition:
              'The application submission stage begins when an application is submitted to the Province and concludes once the reviewing authority has verified its completeness and deems the application complete.'
          },
          {
            code: 'TECHNICAL_REVIEW',
            display: 'Technical review',
            definition:
              'The technical review stage is when the reviewing authority conducts a thorough evaluation of the application and prepares recommendations for making a decision. If applicable, this phase includes First Nation Consultation processes.'
          },
          {
            code: 'PENDING_DECISION',
            display: 'Pending decision',
            definition:
              'The pending decision stage is when the decision-makers review the evaluation and recommendations and make their final decision.'
          },
          {
            code: 'POST_DECISION',
            display: 'Post-decision',
            definition:
              'The post-decision stage is when a decision was made and notifications on the decision have been sent out, it concludes the application.'
          }
        ]);
      })

      // Drop existing check constraints (will be replaced by FK constraints)
      .then(() =>
        knex.schema.raw(`
          ALTER TABLE public.permit
          DROP CONSTRAINT IF EXISTS chk_permit_state;
        `)
      )

      .then(() =>
        knex.schema.raw(`
          ALTER TABLE public.permit
          DROP CONSTRAINT IF EXISTS chk_permit_stage;
        `)
      )

      // Update existing permit data to use new code values
      // Map old state values to new code values
      .then(() =>
        knex.schema.raw(`
            UPDATE public.permit
            SET state = CASE state
              WHEN 'None' THEN 'NONE'
              WHEN 'Initial review' THEN 'INITIAL_REVIEW'
              WHEN 'Accepted' THEN 'ACCEPTED'
              WHEN 'Pending client action' THEN 'PENDING_APPLICANT_ACTION'
              WHEN 'In progress' THEN 'IN_PROGRESS'
              WHEN 'Approved' THEN 'APPROVED'
              WHEN 'Issued' THEN 'ISSUED'
              WHEN 'Denied' THEN 'DENIED'
              WHEN 'Rejected' THEN 'REJECTED'
              WHEN 'Cancelled' THEN 'CANCELLED'
              WHEN 'Withdrawn by client' THEN 'WITHDRAWN'
              ELSE state
            END;
          `)
      )

      // Map old stage values to new code values
      .then(() =>
        knex.schema.raw(`
            UPDATE public.permit
            SET stage = CASE stage
              WHEN 'Pre-submission' THEN 'PRE_SUBMISSION'
              WHEN 'Application submission' THEN 'APPLICATION_SUBMISSION'
              WHEN 'Technical review' THEN 'TECHNICAL_REVIEW'
              WHEN 'Pending decision' THEN 'PENDING_DECISION'
              WHEN 'Post decision' THEN 'POST_DECISION'
              ELSE stage
            END;
          `)
      )

      // Add foreign key constraints to existing columns (without dropping them)
      .then(() =>
        knex.schema.raw(`
            ALTER TABLE public.permit
            ADD CONSTRAINT permit_state_fkey
            FOREIGN KEY (state) REFERENCES permit_state_code(code)
            ON UPDATE CASCADE ON DELETE RESTRICT;
          `)
      )

      .then(() =>
        knex.schema.raw(`
            ALTER TABLE public.permit
            ADD CONSTRAINT permit_stage_fkey
            FOREIGN KEY (stage) REFERENCES permit_stage_code(code)
            ON UPDATE CASCADE ON DELETE RESTRICT;
          `)
      )
  );
}

export async function down(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Drop foreign key constraints from permit table
      .then(() =>
        knex.schema.raw(`
          ALTER TABLE public.permit
          DROP CONSTRAINT IF EXISTS permit_state_fkey;
        `)
      )

      .then(() =>
        knex.schema.raw(`
          ALTER TABLE public.permit
          DROP CONSTRAINT IF EXISTS permit_stage_fkey;
        `)
      )

      // Revert permit data to old display values
      .then(() =>
        knex.schema.raw(`
          UPDATE public.permit
          SET state = CASE state
            WHEN 'NONE' THEN 'None'
            WHEN 'INITIAL_REVIEW' THEN 'Initial review'
            WHEN 'ACCEPTED' THEN 'Accepted'
            WHEN 'PENDING_APPLICANT_ACTION' THEN 'Pending client action'
            WHEN 'IN_PROGRESS' THEN 'In progress'
            WHEN 'APPROVED' THEN 'Approved'
            WHEN 'ISSUED' THEN 'Issued'
            WHEN 'DENIED' THEN 'Denied'
            WHEN 'REJECTED' THEN 'Rejected'
            WHEN 'CANCELLED' THEN 'Cancelled'
            WHEN 'WITHDRAWN' THEN 'Withdrawn by client'
            ELSE state
          END;
        `)
      )

      .then(() =>
        knex.schema.raw(`
          UPDATE public.permit
          SET stage = CASE stage
            WHEN 'PRE_SUBMISSION' THEN 'Pre-submission'
            WHEN 'APPLICATION_SUBMISSION' THEN 'Application submission'
            WHEN 'TECHNICAL_REVIEW' THEN 'Technical review'
            WHEN 'PENDING_DECISION' THEN 'Pending decision'
            WHEN 'POST_DECISION' THEN 'Post decision'
            ELSE stage
          END;
        `)
      )

      // Recreate check constraints (restore original validation)
      .then(() =>
        knex.schema.raw(`
          ALTER TABLE public.permit
          ADD CONSTRAINT chk_permit_state CHECK (state IN (
            'None', 'Initial review', 'Accepted', 'Pending client action', 'In progress',
            'Approved', 'Issued', 'Denied', 'Rejected', 'Cancelled', 'Withdrawn by client'
          ));
        `)
      )

      .then(() =>
        knex.schema.raw(`
          ALTER TABLE public.permit
          ADD CONSTRAINT chk_permit_stage CHECK (stage IN (
            'Pre-submission', 'Application submission', 'Technical review',
            'Pending decision', 'Post decision'
          ));
        `)
      )

      // Drop audit triggers
      .then(async () => await dropAuditLogTrigger(knex, 'public', 'permit_state_code'))
      .then(async () => await dropAuditLogTrigger(knex, 'public', 'permit_stage_code'))

      // Drop public schema table triggers
      .then(async () => await dropUpdatedAtTrigger(knex, 'public', 'permit_state_code'))
      .then(async () => await dropUpdatedAtTrigger(knex, 'public', 'permit_stage_code'))

      // Drop code tables
      .then(() => knex.schema.dropTableIfExists('permit_state_code'))
      .then(() => knex.schema.dropTableIfExists('permit_stage_code'))
  );
}
