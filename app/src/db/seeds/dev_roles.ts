import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('yars.identity_role').del();

  // Inserts seed entries
  await knex('yars.identity_role').insert([
    { identity_id: '8895e3992ee9455b8eef3ab435dd5486@idir', role_id: 1 },
    { identity_id: '8895e3992ee9455b8eef3ab435dd5486@idir', role_id: 3 }
  ]);
}
