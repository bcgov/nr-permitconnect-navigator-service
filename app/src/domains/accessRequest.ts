import { Repositories } from '../repository/unitOfWork';
import { getCorrespondingGlobalGroup } from '../domains/yars';
import { GroupName, Initiative } from '../utils/enums/application';

import type { Group } from '../types';

export const isUserAdmin = async (
  repositories: Pick<Repositories, 'initiative'>,
  currentInitiative: Initiative,
  userGroups: Group[]
): Promise<boolean> => {
  const initiative = await repositories.initiative.findFirstOrThrow({
    where: {
      code: currentInitiative
    }
  });
  return userGroups.some(
    (group: Group) =>
      group.name === GroupName.DEVELOPER ||
      (group.name === GroupName.ADMIN && group.initiativeId === initiative.initiativeId)
  );
};

export const removeUserGroups = async (
  repositories: Pick<Repositories, 'group' | 'initiative' | 'subjectGroup'>,
  sub: string,
  currentInitiative: Initiative,
  userGroups: Group[]
) => {
  // Get the current initiative
  const currentInitiativeId = (
    await repositories.initiative.findFirstOrThrow({
      where: {
        code: currentInitiative
      }
    })
  ).initiativeId;

  // Remove current initiative groups
  const currentInitiativeGroups = userGroups.filter((x) => x.initiativeId === currentInitiativeId);
  await Promise.all(
    currentInitiativeGroups.map(
      async (x) =>
        await repositories.subjectGroup.delete({
          sub_groupId: {
            sub: sub,
            groupId: x.groupId
          }
        })
    )
  );

  // Only remove global perm if user has no groups of the same type assigned in other initiatives
  if (!(await repositories.subjectGroup.subjectHasGroupName(sub, currentInitiativeGroups[0]?.name))) {
    const correspondingGlobalGroups = await Promise.all(
      currentInitiativeGroups.map(
        async (x) =>
          await getCorrespondingGlobalGroup(
            { group: repositories.group, initiative: repositories.initiative },
            x.groupId
          )
      )
    );
    await Promise.all(
      correspondingGlobalGroups.map(
        async (x) =>
          await repositories.subjectGroup.delete({
            sub_groupId: {
              sub: sub,
              groupId: x.groupId
            }
          })
      )
    );
  }
};
