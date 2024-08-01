import stamps from '../stamps';

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Create the access_request table
      .then(() =>
        knex.schema.createTable('access_request', (table) => {
          table.uuid('access_request_id').primary();
          table.uuid('user_id').notNullable().references('user_id').inTable('user');
          table.text('role');
          table
            .enu('status', ['Approved', 'Pending', 'Rejected'], {
              useNative: true,
              enumName: 'access_request_status_enum'
            })
            .defaultTo('Pending')
            .notNullable();
          table.boolean('grant').notNullable();
          stamps(knex, table);
        })
      )

      .then(() =>
        knex.schema.raw(`create trigger before_update_access_request_trigger
          before update on public.access_request
          for each row execute procedure public.set_updated_at();`)
      )

      .then(() =>
        knex.schema.raw(`CREATE TRIGGER audit_access_request_trigger
          AFTER UPDATE OR DELETE ON access_request
          FOR EACH ROW EXECUTE PROCEDURE audit.if_modified_func();`)
      )
  );
}

export async function down(knex: Knex): Promise<void> {
  return (
    Promise.resolve()
      // Drop triggers
      .then(() => knex.schema.raw('DROP TRIGGER IF EXISTS before_update_access_request_trigger ON access_request'))
      .then(() => knex.schema.raw('DROP TRIGGER IF EXISTS audit_access_request_trigger ON access_request'))
      // Drop the access_request table
      .then(() => knex.schema.dropTableIfExists('access_request'))
      // Drop the access_request_status_enum type
      .then(() => knex.schema.raw('DROP TYPE IF EXISTS access_request_status_enum'))
  );
}
