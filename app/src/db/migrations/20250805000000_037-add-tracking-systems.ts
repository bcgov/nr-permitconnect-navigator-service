import type { Knex } from 'knex';

const newSourceSystemCodes = [
  {
    code: 'ITSM-6136',
    display: 'WASTE',
    definition: 'Waste Permit Administration System'
  },
  {
    code: 'TEMP-EDAS',
    display: 'EDAS',
    definition: 'Electronic Development Approvals System'
  }
];

const newSourceSystemKinds = [
  {
    description: 'Tracking Number',
    source_system: 'ITSM-5939'
  },
  {
    description: 'Authorization Number',
    source_system: 'ITSM-6136'
  },
  {
    description: 'Tracking Number',
    source_system: 'ITSM-6136'
  },
  {
    description: 'File Number',
    source_system: 'TEMP-EDAS'
  }
];

export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // TODO: Remove relaxed constraint on source_system_code.code after non NRM systems are finalized
      // Relax constraint on source_system_code.code to allow TEMP-XXXX codes
      .then(() => {
        return knex.schema.raw(`
          ALTER TABLE source_system_code
          DROP CONSTRAINT IF EXISTS source_system_code_code_check,
          ADD CONSTRAINT source_system_code_code_check
          CHECK (code ~ '^(ITSM-[0-9]{4,5}|TEMP-[A-Z]+)$')
        `);
      })

      // Seed new source system codes
      .then(() => {
        return knex('source_system_code').insert(newSourceSystemCodes).onConflict().ignore();
      })

      // Seed new source system kinds
      .then(() => {
        return knex('source_system_kind').insert(newSourceSystemKinds).onConflict().ignore();
      })

      // Update PPA acronym in source_system_code to ePUPS
      .then(() => {
        return knex('source_system_code').where('code', 'ITSM-5939').update({ display: 'ePUPS' });
      })
  );
}

export async function down(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Revert ePUPS acronym change in source_system_code back to PPA
      .then(() => {
        return knex('source_system_code').where('code', 'ITSM-5939').update({ display: 'PPA' });
      })

      // Delete new source system kinds
      .then(() => {
        return knex('source_system_kind')
          .whereIn(
            ['source_system', 'description'],
            newSourceSystemKinds.map((k) => [k.source_system, k.description])
          )
          .del();
      })

      // Delete new source system codes
      .then(() => {
        return knex('source_system_code')
          .whereIn(
            'code',
            newSourceSystemCodes.map((code) => code.code)
          )
          .del();
      })

      // Restore the original strict check
      .then(() => {
        return knex.schema.raw(`
          ALTER TABLE source_system_code
          DROP CONSTRAINT IF EXISTS source_system_code_code_check,
          ADD CONSTRAINT source_system_code_code_check
          CHECK (code ~ '^ITSM-[0-9]{4,5}$')
        `);
      })
  );
}
