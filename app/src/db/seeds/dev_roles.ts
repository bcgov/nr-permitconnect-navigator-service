import { Knex } from 'knex';
import { GroupName, Initiative } from '../../utils/enums/application';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('yars.identity_group').del();

  const pcns_id = knex('initiative')
    .where({
      code: Initiative.PCNS
    })
    .select('initiative_id');

  const developer_group_id = await knex('yars.group')
    .where({ initiative_id: pcns_id, name: GroupName.DEVELOPER })
    .select('group_id');

  // Inserts seed entries
  await knex('yars.identity_group').insert([
    { identity_id: '8895e3992ee9455b8eef3ab435dd5486@idir', group_id: developer_group_id[0].group_id }
  ]);
}
