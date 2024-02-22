/* eslint-disable max-len */

import stamps from '../stamps';

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return Promise.resolve().then(() =>
    knex.schema
      .createTable('test_table_number_two', (table) => {
        table.text('test_table_number_two_id').primary();
        table.text('some_column');
        stamps(knex, table);
      })

      .then(() =>
        knex.schema.alterTable('test_table', (table) => {
          table.text('the_new_column');
        })
      )
  );
}

export async function down(knex: Knex): Promise<void> {
  return Promise.resolve()
    .then(() =>
      knex.schema.alterTable('test_table', (table) => {
        table.dropColumn('the_new_column');
      })
    )
    .then(() => knex.schema.dropTableIfExists('test_table_number_two'));
}
