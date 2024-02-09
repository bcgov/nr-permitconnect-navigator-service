import { NIL } from 'uuid';

// TODO: Figure out these Knex types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function (knex: any, table: any) {
  table.text('created_by').defaultTo(NIL);
  table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
  table.text('updated_by');
  table.timestamp('updated_at', { useTz: true });
}

export type Stamps = {
  created_by: string | null;
  created_at: string | null;
  updated_by: string | null;
  updated_at: string | null;
};
