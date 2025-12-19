import { Knex } from 'knex';
import { GroupName, Initiative } from '../../utils/enums/application.ts';

export async function seed(knex: Knex): Promise<void> {
  const pcns_id = knex('initiative')
    .where({
      code: Initiative.PCNS
    })
    .select('initiative_id');

  const developer_group_id = await knex('yars.group')
    .where({ initiative_id: pcns_id, name: GroupName.DEVELOPER })
    .select('group_id');

  const identities = [
    { sub: '8895e3992ee9455b8eef3ab435dd5486@idir', group_id: developer_group_id[0].group_id },
    { sub: 'a64c23b15d964d9b979188f356e083ea@idir', group_id: developer_group_id[0].group_id },
    { sub: '333c6b2f38454628b638ca4ac52eab68@idir', group_id: developer_group_id[0].group_id },
    { sub: 'e268cd73d4b544d4bc2c978fb98f342a@idir', group_id: developer_group_id[0].group_id },
    { sub: 'e7d30762682b437cb8d60502c956a516@idir', group_id: developer_group_id[0].group_id },
    { sub: 'd79fb88e50414ca789620bb89915b2e5@idir', group_id: developer_group_id[0].group_id },
    { sub: '4a07a001034549d79f525715378e617a@idir', group_id: developer_group_id[0].group_id }
  ];

  const exists = await knex('yars.subject_group').whereIn(
    'sub',
    identities.map((x) => x.sub)
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filtered = identities.filter((x) => !exists.some((y: any) => y.sub === x.sub));

  // Inserts missing seed entries
  if (filtered.length > 0) {
    await knex('yars.subject_group').insert(filtered);
  }
}
