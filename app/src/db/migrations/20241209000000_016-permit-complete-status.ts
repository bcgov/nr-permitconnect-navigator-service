import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    knex.schema.raw(`update public.permit
        set auth_status = case
          when auth_status = 'Granted' then 'Approved'
          else auth_status
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
