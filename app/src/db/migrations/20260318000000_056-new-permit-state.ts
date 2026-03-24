import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return Promise.resolve()
    .then(() =>
      knex.raw(`
        ALTER TABLE permit
          DROP CONSTRAINT IF EXISTS chk_permit_state;

        ALTER TABLE permit
          ADD CONSTRAINT chk_permit_state
            CHECK (state = ANY (ARRAY[
              'Initial review',
              'Pending client action',
              'In progress',
              'Accepted',
              'Approved',
              'Issued',
              'Cancelled',
              'Denied',
              'Rejected',
              'Withdrawn by client',
              'None'
            ]::text[])) NOT VALID;
      `)
    )
    .then(() => knex.raw('ALTER TABLE permit VALIDATE CONSTRAINT chk_permit_state;'));
}

export async function down(knex: Knex): Promise<void> {
  return Promise.resolve()
    .then(() =>
      knex.raw(`
        ALTER TABLE permit
          DROP CONSTRAINT IF EXISTS chk_permit_state;

        ALTER TABLE permit
          ADD CONSTRAINT chk_permit_state
            CHECK (state = ANY (ARRAY[
              'Initial review',
              'Pending client action',
              'In progress',
              'Approved',
              'Issued',
              'Cancelled',
              'Denied',
              'Rejected',
              'Withdrawn by client',
              'None'
            ]::text[])) NOT VALID;
      `)
    )
    .then(() => knex.raw('ALTER TABLE permit VALIDATE CONSTRAINT chk_permit_state;'));
}
