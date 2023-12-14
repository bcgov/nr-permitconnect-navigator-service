import { NIL } from 'uuid';

// TODO: Figure out these Knex types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function (knex: any, table: any) {
  table.text('createdBy').defaultTo(NIL);
  table.timestamp('createdAt', { useTz: true }).defaultTo(knex.fn.now());
  table.text('updatedBy');
  table.timestamp('updatedAt', { useTz: true });
}
