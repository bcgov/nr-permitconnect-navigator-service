/* eslint-disable max-len */
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return Promise.resolve()
    .then(() => knex.schema.renameTable('submission', 'housing_project'))
    .then(() =>
      knex.schema.alterTable('housing_project', function (table) {
        table.renameColumn('submission_id', 'housing_project_id');
        table.renameColumn('submission_type', 'housing_project_type');
      })
    )
    .then(() =>
      knex('draft_code').where('draft_code', '=', 'SUBMISSION').update({
        draft_code: 'HOUSING_PROJECT'
      })
    )
    .then(() =>
      knex('yars.resource').where('name', '=', 'SUBMISSION').update({
        name: 'HOUSING_PROJECT'
      })
    );
}

export async function down(knex: Knex): Promise<void> {
  return Promise.resolve()
    .then(() =>
      knex('yars.resource').where('name', '=', 'HOUSING_PROJECT').update({
        name: 'SUBMISSION'
      })
    )
    .then(() =>
      knex('draft_code').where('draft_code', '=', 'HOUSING_PROJECT').update({
        draft_code: 'SUBMISSION'
      })
    )
    .then(() =>
      knex.schema.alterTable('housing_project', function (table) {
        table.renameColumn('housing_project_type', 'submission_type');
        table.renameColumn('housing_project_id', 'submission_id');
      })
    )
    .then(() => knex.schema.renameTable('housing_project', 'submission'));
}
