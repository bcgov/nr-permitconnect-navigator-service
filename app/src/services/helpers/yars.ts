import { PrismaTransactionClient } from '../../db/database';
import { GroupName } from '../../utils/enums/application';

import type { Group } from '../../types';

export const getSubjectGroups = async (tx: PrismaTransactionClient, sub: string): Promise<Group[]> => {
  const result = await tx.subject_group.findMany({
    where: {
      sub: sub
    },
    include: {
      group: {
        include: {
          initiative: true
        }
      }
    }
  });

  return result.map((x) => ({
    initiativeCode: x.group.initiative.code,
    initiativeId: x.group.initiativeId,
    groupId: x.groupId,
    name: x.group.name as GroupName,
    label: x.group.label
  })) as Group[];
};
