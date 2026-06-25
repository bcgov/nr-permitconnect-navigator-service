import { Repositories } from '../repository/uow';
import { GroupName, Initiative } from '../utils/enums/application';

import type { Group } from '../types';

export const assignGroup = async (
  repositories: Pick<Repositories, 'group' | 'subjectGroup'>,
  sub: string,
  groupId: number
): Promise<{ sub: string; roleId: number }> => {
  const exists = await repositories.subjectGroup.subjectHasGroup(sub, groupId);
  if (exists) return { sub, roleId: groupId };

  const groupResult = await repositories.group.findFirstOrThrow({
    where: {
      groupId
    }
  });

  const result = await repositories.subjectGroup.create({
    sub: sub,
    group: { connect: { groupId: groupResult.groupId } }
  });

  return { sub: result.sub, roleId: result.groupId };
};

export const getCorrespondingGlobalGroup = async (
  repositories: Pick<Repositories, 'group' | 'initiative'>,
  groupId: number
): Promise<Group> => {
  const grp = await repositories.group.findFirstOrThrow({
    where: {
      groupId
    }
  });

  const globalInitiative = await repositories.initiative.findFirstOrThrow({
    where: {
      code: Initiative.PCNS
    }
  });

  const result = await repositories.group.findFirstOrThrow({
    where: {
      initiativeId: globalInitiative.initiativeId,
      name: grp.name
    }
  });

  return {
    initiativeCode: globalInitiative.code,
    initiativeId: globalInitiative.initiativeId,
    groupId: result.groupId,
    name: result.name as GroupName,
    label: result.label
  };
};

export const getGroups = async (
  repositories: Pick<Repositories, 'group' | 'initiative'>,
  initiativeCode: Initiative | undefined
) => {
  const i = await repositories.initiative.findFirstOrThrow({
    where: {
      code: initiativeCode
    }
  });

  const result = await repositories.group.findMany({
    where: {
      initiativeId: i.initiativeId
    }
  });

  return result.map((x) => ({
    initiativeCode: i.code,
    groupId: x.groupId,
    initiativeId: x.initiativeId,
    name: x.name as GroupName,
    label: x.label
  }));
};
