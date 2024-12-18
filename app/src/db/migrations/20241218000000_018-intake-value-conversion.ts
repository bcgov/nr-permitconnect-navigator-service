/* eslint-disable max-len */
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    knex.schema.raw(`update public.permit
        set contactApplicantRelationship = case
          when contactApplicantRelationship = 'Owner' then 'Project owner'
          when contactApplicantRelationship = 'Employee' then 'Project consultant'
          when contactApplicantRelationship = 'Agent' then 'Project consultant'
          else contactApplicantRelationship = name
        end`)
  );
}

export async function down(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    knex.schema.raw(`update public.permit
        set auth_status = case
          when auth_status = 'Approved' then 'Granted'
          else auth_status
        end`)
  );
}
