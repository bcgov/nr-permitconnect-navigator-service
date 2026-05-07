import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return Promise.resolve()
    .then(() => {
      return knex('identity_provider')
        .insert([
          {
            idp: 'azureidir'
          }
        ])
        .onConflict('idp')
        .ignore();
    })
    .then(() =>
      knex.raw(`UPDATE public.user
      SET
        idp = 'azureidir',
        sub = REGEXP_REPLACE(sub, '@idir$', '@azureidir')
      WHERE sub ~ '@idir$';`)
    )
    .then(() =>
      knex.raw(`UPDATE yars.subject_group
      SET
        sub = REGEXP_REPLACE(sub, '@idir$', '@azureidir')
      WHERE sub ~ '@idir$';`)
    );
}

export async function down(knex: Knex): Promise<void> {
  return Promise.resolve()
    .then(() =>
      knex.raw(`UPDATE yars.subject_group
      SET
        sub = REGEXP_REPLACE(sub, '@azureidir$', '@idir' )
      WHERE sub ~ '@azureidir$';`)
    )
    .then(() =>
      knex.raw(`UPDATE public.user
      SET
        idp = 'idir',
        sub = REGEXP_REPLACE(sub, '@azureidir$', '@idir' )
      WHERE sub ~ '@azureidir$';`)
    )
    .then(() => {
      return knex('identity_provider').where('idp', 'azureidir').del();
    });
}
