import { NIL } from 'uuid';

export default function (knex: any, table: any) {
  table.string('createdBy').defaultTo(NIL);
  table.timestamp('createdAt', { useTz: true }).defaultTo(knex.fn.now());
  table.string('updatedBy');
  table.timestamp('updatedAt', { useTz: true });
}
