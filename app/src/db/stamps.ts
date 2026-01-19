import { Knex } from 'knex';
import { SYSTEM_ID } from '../utils/constants/application.ts';

export default function (knex: Knex, table: Knex.CreateTableBuilder) {
  table.text('created_by').defaultTo(SYSTEM_ID);
  table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
  table.text('updated_by');
  table.timestamp('updated_at', { useTz: true });
  table.text('deleted_by');
  table.timestamp('deleted_at', { useTz: true });
}

export interface Stamps {
  created_by: string | null;
  created_at: string | null;
  updated_by: string | null;
  updated_at: string | null;
  deleted_by: string | null;
  deleted_at: string | null;
}
