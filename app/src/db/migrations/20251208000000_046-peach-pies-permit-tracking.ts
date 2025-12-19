import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Add status_last_changed, new date/time split columns and rename columns to match PEACH
      .then(() =>
        knex.schema.alterTable('permit', (table) => {
          table.date('decision_date');
          table.date('status_last_changed');
          table.specificType('decision_time', 'timetz(6)');
          table.specificType('status_last_changed_time', 'timetz(6)');
          table.specificType('status_last_verified_time', 'timetz(6)');
          table.specificType('submitted_time', 'timetz(6)');
          table.renameColumn('auth_status', 'state');
          table.renameColumn('status', 'stage');
        })
      )

      // Abandoned/Withdrawn -> Withdrawn by client
      .then(() => knex('permit').whereIn('state', ['Abandoned', 'Withdrawn']).update({ state: 'Withdrawn by client' }))

      // Post-decision -> Post decision
      .then(() => knex('permit').where('stage', 'Post-decision').update({ stage: 'Post decision' }))

      // Fill NULLs so we can safely enforce NOT NULL
      .then(() => knex('permit').whereNull('state').update({ state: 'None' }))
      .then(() => knex('permit').whereNull('stage').update({ stage: 'Pre-submission' }))

      // Backfill new time/date columns from existing timestamp columns
      .then(() =>
        knex.raw(`
          UPDATE permit
          SET
            submitted_time = CASE
              WHEN submitted_date::time = '00:00:00'::time THEN NULL
              ELSE submitted_date::time
            END,
            decision_date = adjudication_date::date,
            decision_time = CASE
              WHEN adjudication_date::time = '00:00:00'::time THEN NULL
              ELSE adjudication_date::time
            END,
            status_last_verified_time = CASE
              WHEN status_last_verified::time = '00:00:00'::time THEN NULL
              ELSE status_last_verified::time
            END
        `)
      )

      // Convert datetime columns to date + drop adjudication_date (rename concept to decision)
      .then(() =>
        knex.raw(`
          ALTER TABLE permit
            ALTER COLUMN submitted_date TYPE date USING submitted_date::date,
            ALTER COLUMN status_last_verified TYPE date USING status_last_verified::date,
            ALTER COLUMN status_last_changed TYPE date USING status_last_changed::date,
            DROP COLUMN adjudication_date;
        `)
      )

      // Add `integrated` flag to source_system_kind
      .then(() =>
        knex.schema.alterTable('source_system_kind', (table) => {
          table.boolean('integrated').notNullable().defaultTo(false);
        })
      )

      // Add new source_system_kind row
      .then(() =>
        knex('source_system_kind').insert({
          description: 'Authorization ID',
          source_system: 'ITSM-5314'
        })
      )

      // Flag PEACH-integrated source system kinds
      .then(() =>
        knex('source_system_kind')
          .whereIn(
            ['source_system', 'description'],
            [
              ['ITSM-6072', 'Disposition Transaction ID'],
              ['ITSM-6197', 'Job Number'],
              ['ITSM-6117', 'Tracking Number'],
              ['ITSM-5314', 'Authorization ID']
            ]
          )
          .update({ integrated: true })
      )

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

      // Recreate adjudication_date and merge decision_* and *_time back into timestamps
      .then(() =>
        knex.schema.alterTable('permit', (table) => {
          table.timestamp('adjudication_date', { useTz: true });
        })
      )

      // Backfill adjudication_date from decision_date + decision_time
      .then(() =>
        knex.raw(`
          UPDATE permit
          SET adjudication_date = (
            decision_date
            + COALESCE(decision_time::time, '00:00'::time)
          )::timestamptz;
        `)
      )

      // Convert submitted_date/status_last_verified back to timestamps using their *_time columns
      .then(() =>
        knex.raw(`
          ALTER TABLE permit
            ALTER COLUMN submitted_date TYPE timestamptz USING (
              submitted_date
              + COALESCE(submitted_time::time, '00:00'::time)
            ),
            ALTER COLUMN status_last_verified TYPE timestamptz USING (
              status_last_verified
              + COALESCE(status_last_verified_time::time, '00:00'::time)
            );
        `)
      )
      // Drop the split time/date columns
      .then(() =>
        knex.schema.alterTable('permit', (table) => {
          table.dropColumn('decision_date');
          table.dropColumn('decision_time');
          table.dropColumn('status_last_verified_time');
          table.dropColumn('status_last_changed_time');
          table.dropColumn('submitted_time');
        })
      )

      // Remove the source_system_kind row
      .then(() =>
        knex('source_system_kind')
          .where({
            description: 'Authorization ID',
            source_system: 'ITSM-5314'
          })
          .del()
      )

      // Drop `integrated` column from source_system_kind
      .then(() =>
        knex.schema.alterTable('source_system_kind', (table) => {
          table.dropColumn('integrated');
        })
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
  );
}
