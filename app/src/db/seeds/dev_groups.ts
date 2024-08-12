import { Knex } from 'knex';
import { GroupName, Initiative } from '../../utils/enums/application';

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
    { identity_id: '8895e3992ee9455b8eef3ab435dd5486@idir', group_id: developer_group_id[0].group_id },
    { identity_id: '17222a61118846b08bdda2769a585278@idir', group_id: developer_group_id[0].group_id },
    { identity_id: 'a64c23b15d964d9b979188f356e083ea@idir', group_id: developer_group_id[0].group_id },
    { identity_id: '333c6b2f38454628b638ca4ac52eab68@idir', group_id: developer_group_id[0].group_id },
    { identity_id: 'c08877190e084a058c42d9dddb245b03@idir', group_id: developer_group_id[0].group_id },
    { identity_id: 'e7d30762682b437cb8d60502c956a516@idir', group_id: developer_group_id[0].group_id },
    { identity_id: 'ff3ce3f9a6664dfd82a303a189411446@idir', group_id: developer_group_id[0].group_id },
    { identity_id: '4a07a001034549d79f525715378e617a@idir', group_id: developer_group_id[0].group_id }
  ];

  const exists = await knex('yars.identity_group').whereIn(
    'identity_id',
    identities.map((x) => x.identity_id)
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filtered = identities.filter((x) => !exists.some((y: any) => y.identity_id === x.identity_id));

  // Inserts missing seed entries
  if (filtered.length > 0) {
    await knex('yars.identity_group').insert(filtered);
  }
}
