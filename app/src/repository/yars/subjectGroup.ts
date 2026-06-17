import { Prisma } from '@prisma/client';

import { BaseRepository } from '../base.ts';
import { GroupName, Initiative } from '../../utils/enums/application.ts';

import type { PrismaTransactionClient } from '../../db/database.ts';
import type { Group } from '../../types/stuff';

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
const subject_group = Prisma.validator<Prisma.subject_groupDefaultArgs>()({});
export type SubjectGroupBase = Prisma.subject_groupGetPayload<typeof subject_group>;

export class SubjectGroupRepository extends BaseRepository<
  SubjectGroupBase,
  Prisma.subject_groupCreateInput,
  Prisma.subject_groupUpdateInput,
  Prisma.subject_groupWhereUniqueInput,
  Prisma.subject_groupWhereInput,
  Prisma.subject_groupFindUniqueArgs,
  Prisma.subject_groupFindFirstArgs,
  Prisma.subject_groupFindManyArgs,
  PrismaTransactionClient['subject_group']
> {
  private constructor(model: PrismaTransactionClient['subject_group'], principal: string) {
    super(model, principal, false);
  }

  static create(tx: PrismaTransactionClient, principal: string): SubjectGroupRepository {
    return new SubjectGroupRepository(tx.subject_group, principal);
  }

  /**
   * Gets groups for the specified identity
   * @param sub Subject to search
   * @returns A Promise that resolves into an array of groups
   */
  async getSubjectGroups(sub: string): Promise<Group[]> {
    const result = await this.model.findMany({
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
  }

  /**
   * Gets initiatives for the specified identity
   * @param sub Subject to search
   * @returns A Promise that resolves into an array of initiative IDs and codes
   */
  async getSubjectInitiatives(sub: string): Promise<{ code: string; initiativeId: string }[]> {
    const result = await this.model.findMany({
      select: {
        group: {
          select: {
            initiativeId: true,
            initiative: {
              select: {
                code: true
              }
            }
          }
        }
      },
      where: {
        sub: sub,
        NOT: {
          group: {
            initiative: {
              code: Initiative.PCNS
            }
          }
        }
      }
    });

    return result.map((x) => ({
      code: x.group.initiative.code,
      initiativeId: x.group.initiativeId
    }));
  }

  /**
   * Check if a subject belongs to a specific group ID
   * @param sub The subject of the current user
   * @param groupId The ID of the group to check
   * @returns A Promise that resolves to a boolean
   */
  async subjectHasGroup(sub: string, groupId: number) {
    const count = await this.model.count({
      where: {
        sub,
        groupId
      }
    });

    return count > 0;
  }

  /**
   * Check if a subject belongs to a specific group name, excluding the global group
   * @param sub The subject of the current user
   * @param groupName The name of the group to check
   * @returns A Promise that resolves to a boolean
   */
  async subjectHasGroupName(sub: string, groupName: GroupName | undefined) {
    if (!groupName) return false;

    const count = await this.model.count({
      where: {
        sub: sub,
        group: {
          name: groupName
        },
        NOT: {
          group: {
            initiative: {
              code: Initiative.PCNS
            }
          }
        }
      }
    });

    return count > 0;
  }

  /**
   * Check if a subject belongs to a specific set of group names within an initiative
   * @param sub The subject of the current user
   * @param initiativeCode Initiative the groups belong to
   * @param groupNames Array of group names to check
   * @returns A Promise that resolves to a boolean
   */
  async subjectHasInitiativeGroupName(sub: string, initiativeCode: Initiative, groupNames: (GroupName | undefined)[]) {
    const groupArray: GroupName[] = groupNames.filter(Boolean) as GroupName[];

    if (groupNames.length === 0) return false;

    const count = await this.model.count({
      where: {
        sub: sub,
        group: {
          name: { in: groupArray },
          initiative: { code: initiativeCode }
        }
      }
    });

    return count > 0;
  }
}
