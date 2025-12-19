import { NIL } from 'uuid';

import { SYSTEM_ID } from '../../utils/constants/application.ts';

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return Promise.resolve()
    .then(() => {
      return knex('user').where('user_id', NIL).update({ user_id: SYSTEM_ID });
    })

    .then(() =>
      knex.raw(`DO $$
        DECLARE
            target_guid text := '00000000-0000-4000-8000-000000000000';
            old_guid text := '00000000-0000-0000-0000-000000000000';
            rec RECORD;
            update_sql text;
        BEGIN
            -- Loop through all columns of type text
            FOR rec IN
                SELECT table_name, table_schema, column_name
                FROM information_schema.columns
                WHERE data_type = 'text' AND table_schema IN ('public', 'yars') AND is_updatable = 'YES'
            LOOP
                -- Generate the UPDATE statement for each table/column
                update_sql := format(
                    'UPDATE %I.%I SET %I = %L WHERE %I = %L',
                    rec.table_schema, rec.table_name, rec.column_name, target_guid, rec.column_name, old_guid
                );

                -- Execute the generated SQL for each column
                EXECUTE update_sql;
            END LOOP;
        END $$;`)
    )

    .then(() =>
      knex.raw(`DO $$
        DECLARE
            target_column text := 'created_by';
            target_guid text := '00000000-0000-4000-8000-000000000000';
            rec RECORD;
            update_sql text;
        BEGIN
            -- Loop through all created_by columns
            FOR rec IN
                SELECT table_name, table_schema, column_name
                FROM information_schema.columns
                WHERE column_name = target_column AND table_schema IN ('public', 'yars') AND is_updatable = 'YES'
            loop
              -- Generate the statement for each column
              update_sql := format(
                    'ALTER TABLE %I.%I ALTER COLUMN %I SET DEFAULT %L',
                    rec.table_schema, rec.table_name, target_column, target_guid
                );

                -- Execute the generated SQL for each column
                EXECUTE update_sql;
            END LOOP;
        END $$;`)
    );
}

export async function down(knex: Knex): Promise<void> {
  return Promise.resolve()
    .then(() =>
      knex.raw(`DO $$
        DECLARE
            target_column text := 'created_by';
            target_guid text := '00000000-0000-0000-0000-000000000000';
            rec RECORD;
            update_sql text;
        BEGIN
            -- Loop through all created_by columns
            FOR rec IN
                SELECT table_name, table_schema, column_name
                FROM information_schema.columns
                WHERE column_name = target_column AND table_schema IN ('public', 'yars') AND is_updatable = 'YES'
            loop
              -- Generate the statement for each column
              update_sql := format(
                    'ALTER TABLE %I.%I ALTER COLUMN %I SET DEFAULT %L',
                    rec.table_schema, rec.table_name, target_column, target_guid
                );

                -- Execute the generated SQL for each column
                EXECUTE update_sql;
            END LOOP;
        END $$;`)
    )

    .then(() =>
      knex.raw(`DO $$
        DECLARE
            target_guid text := '00000000-0000-0000-0000-000000000000';
            old_guid text := '00000000-0000-4000-8000-000000000000';
            rec RECORD;
            update_sql text;
        BEGIN
            -- Loop through all columns of type text
            FOR rec IN
                SELECT table_name, table_schema, column_name
                FROM information_schema.columns
                WHERE data_type = 'text' AND table_schema IN ('public', 'yars') AND is_updatable = 'YES'
            LOOP
                -- Generate the UPDATE statement for each table/column
                update_sql := format(
                    'UPDATE %I.%I SET %I = %L WHERE %I = %L',
                    rec.table_schema, rec.table_name, rec.column_name, target_guid, rec.column_name, old_guid
                );

                -- Execute the generated SQL for each column
                EXECUTE update_sql;
            END LOOP;
        END $$;`)
    )

    .then(() => {
      return knex('user').where('user_id', SYSTEM_ID).update({ user_id: NIL });
    });
}
