import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Add status_last_changed and rename columns
      .then(() =>
        knex.schema.alterTable('permit', (table) => {
          table.timestamp('status_last_changed', { useTz: true });
          table.renameColumn('auth_status', 'state');
          table.renameColumn('status', 'stage');
        })
      )

      // Abandoned/Withdrawn -> Withdrawn by client
      .then(() => knex('permit').whereIn('state', ['Abandoned', 'Withdrawn']).update({ state: 'Withdrawn by client' }))

      // Post-decision -> Post decision
      .then(() => knex('permit').where('stage', 'Post-decision').update({ stage: 'Post decision' }))

      // Fill NULLs so we can safely cast to enums and enforce NOT NULL
      .then(() => knex('permit').whereNull('state').update({ state: 'None' }))
      .then(() => knex('permit').whereNull('stage').update({ stage: 'Pre-submission' }))

      // Add CHECK constraints (NOT VALID to keep lock time low)
      .then(() =>
        knex.raw(`
        ALTER TABLE permit
          ADD CONSTRAINT chk_permit_state
            CHECK (state = ANY (ARRAY[
              'Initial review','Pending client action','In progress','Approved',
              'Issued','Cancelled','Denied','Rejected','Withdrawn by client','None'
            ]::text[])) NOT VALID,
          ADD CONSTRAINT chk_permit_stage
            CHECK (stage = ANY (ARRAY[
              'Pre-submission','Application submission','Technical review',
              'Pending decision','Post decision'
            ]::text[])) NOT VALID;
      `)
      )

      // Validate the constraints (runs a background scan, shorter locks)
      .then(() => knex.raw('ALTER TABLE permit VALIDATE CONSTRAINT chk_permit_state;'))
      .then(() => knex.raw('ALTER TABLE permit VALIDATE CONSTRAINT chk_permit_stage;'))

      // Make stage and state NOT NULLABLE
      .then(() =>
        knex.raw(`
        ALTER TABLE permit
          ALTER COLUMN state SET NOT NULL,
          ALTER COLUMN stage SET NOT NULL;
        `)
      )
  );
}

export async function down(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Drop NOT NULL for stage and state
      .then(() =>
        knex.raw(`
        ALTER TABLE permit
          ALTER COLUMN state DROP NOT NULL,
          ALTER COLUMN stage DROP NOT NULL;
      `)
      )

      // Drop CHECK constraints
      .then(() =>
        knex.raw(`
        ALTER TABLE permit
          DROP CONSTRAINT IF EXISTS chk_permit_state,
          DROP CONSTRAINT IF EXISTS chk_permit_stage;
      `)
      )

      // Withdrawn by client -> Withdrawn
      .then(() => knex('permit').where('state', 'Withdrawn by client').update({ state: 'Withdrawn' }))

      // Post decision -> Post-decision
      .then(() => knex('permit').where('stage', 'Post decision').update({ stage: 'Post-decision' }))

      // Drop status_last_changed and revert columns names
      .then(() =>
        knex.schema.alterTable('permit', (table) => {
          table.dropColumn('status_last_changed');
          table.renameColumn('state', 'auth_status');
          table.renameColumn('stage', 'status');
        })
      )

      // Drop enum types
      .then(() =>
        knex.raw(`
        DROP TYPE IF EXISTS permit_state;
        DROP TYPE IF EXISTS permit_stage;
      `)
      )
  );
}
