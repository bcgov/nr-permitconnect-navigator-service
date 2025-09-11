import type { Knex } from 'knex';

const newSourceSystemKinds = [
  {
    description: 'Disposition Transaction ID',
    source_system: 'ITSM-6072'
  }
];

export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Seed new source system kinds
      .then(() => {
        return knex('source_system_kind').insert(newSourceSystemKinds).onConflict().ignore();
      })

      // Update eDAS to its new ITSM number
      .then(() => {
        return knex('source_system_code').where('code', 'TEMP-EDAS').update({ code: 'ITSM-60081' });
      })

      // Update kinds to new eDAS ITSM number
      .then(() => {
        return knex('source_system_kind').where('source_system', 'TEMP-EDAS').update({ source_system: 'ITSM-60081' });
      })

      // Restore the original strict check on ITSM numbers
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

export async function down(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Relax constraint on source_system_code.code to allow TEMP-XXXX codes
      .then(() => {
        return knex.schema.raw(`
          ALTER TABLE source_system_code
          DROP CONSTRAINT IF EXISTS source_system_code_code_check,
          ADD CONSTRAINT source_system_code_code_check
          CHECK (code ~ '^(ITSM-[0-9]{4,5}|TEMP-[A-Z]+)$')
        `);
      })

      // Revert eDAS ITSM number
      .then(() => {
        return knex('source_system_code').where('code', 'ITSM-60081').update({ code: 'TEMP-EDAS' });
      })

      // Update kinds to new eDAS ITSM number
      .then(() => {
        return knex('source_system_kind').where('source_system', 'ITSM-60081').update({ source_system: 'TEMP-EDAS' });
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
  );
}
