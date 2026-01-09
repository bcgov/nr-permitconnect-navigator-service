import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    knex('permit_type').where('agency', 'Transportation and Transit').update({
      branch: 'Planning and Major Projects',
      division: 'Highways and Regional Services',
      source_system: 'Electronic Development Approvals System',
      source_system_acronym: 'eDAS'
    })
  );
}

export async function down(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    knex('permit_type').where('agency', 'Transportation and Transit').update({
      branch: null,
      division: null,
      source_system: null,
      source_system_acronym: null
    })
  );
}
