import { transactionWrapper } from '../db/utils/transactionWrapper.ts';
import { GroupName, Initiative } from '../utils/enums/application.ts';
import { addDashesToUuid, mixedQueryToArray, isTruthy } from '../utils/utils.ts';
import { getInitiative } from '../services/initiative.ts';
import { searchUsers } from '../services/user.ts';
import { getSubjectGroups } from '../services/yars.ts';

import type { Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/dataConnection.ts';
import type { Group, User, UserSearchParameters } from '../types/index.ts';

export const searchUsersController = async (req: Request<never, never, never, UserSearchParameters>, res: Response) => {
  type UserWithGroup = User & { groups?: Group[] };

  const response = await transactionWrapper<UserWithGroup[]>(async (tx: PrismaTransactionClient) => {
    const reqGroup = mixedQueryToArray(req.query.group) as GroupName[];
    const reqInitiative = mixedQueryToArray(req.query.initiative) as Initiative[];
    const userIds = mixedQueryToArray(req.query.userId);

    const response = await searchUsers(tx, {
      userId: userIds ? userIds.map((id) => addDashesToUuid(id)) : userIds,
      idp: mixedQueryToArray(req.query.idp),
      sub: req.query.sub,
      email: req.query.email,
      firstName: req.query.firstName,
      fullName: req.query.fullName,
      lastName: req.query.lastName,
      active: isTruthy(req.query.active)
    });

    // Inject found users with their groups if necessary
    let userWithGroups: UserWithGroup[] = response;

    if (reqGroup?.length || isTruthy(req.query.includeUserGroups)) {
      for (const user of userWithGroups) {
        user.groups = await getSubjectGroups(tx, user.sub);
      }

      // Filters users based on groups
      if (reqGroup?.length) {
        userWithGroups = userWithGroups.filter((user) =>
          reqGroup.some((g) => user.groups?.some((ug) => ug.name === g))
        );
      }

      // Filters user groups based on initiative
      if (reqInitiative?.length) {
        const initiative = (await Promise.all(reqInitiative.map((i) => getInitiative(tx, i)))).flatMap((r) => r);
        userWithGroups.forEach((user) => {
          if (user.groups)
            user.groups = user.groups.filter((ug) => initiative.some((i) => ug.initiativeId === i.initiativeId));
        });
      }

      // Remove groups if not requested
      if (!isTruthy(req.query.includeUserGroups)) {
        for (const user of userWithGroups) {
          delete user.groups;
        }
      }
    }

    return userWithGroups;
  });

  res.status(200).json(response);
};
