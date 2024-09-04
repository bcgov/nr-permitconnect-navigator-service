import { userService, yarsService } from '../services';
import { User } from '../types';
import { GroupName } from '../utils/enums/application';
import { addDashesToUuid, mixedQueryToArray, isTruthy } from '../utils/utils';

import type { NextFunction, Request, Response } from 'express';

const controller = {
  searchUsers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqGroup = mixedQueryToArray(req.query.group as string) as GroupName[];
      const userIds = mixedQueryToArray(req.query.userId as string);

      const response = await userService.searchUsers({
        userId: userIds ? userIds.map((id) => addDashesToUuid(id)) : userIds,
        identityId: mixedQueryToArray(req.query.identityId as string),
        idp: mixedQueryToArray(req.query.idp as string),
        sub: req.query.sub as string,
        email: req.query.email as string,
        firstName: req.query.firstName as string,
        fullName: req.query.fullName as string,
        lastName: req.query.lastName as string,
        active: isTruthy(req.query.active as string)
      });

      type UserWithGroup = User & { groups?: GroupName[] };

      // Inject found users with their groups if necessary
      let userWithGroups: Array<UserWithGroup> = response;

      if (reqGroup?.length || isTruthy(req.query.includeUserGroups)) {
        for (const user of userWithGroups) {
          const groups = await yarsService.getSubjectGroups(user.sub);
          user.groups = groups.map((x) => x.groupName);
        }

        // Filters users based on searched groups
        if (reqGroup?.length) {
          userWithGroups = userWithGroups.filter((user) => reqGroup.some((g) => user.group?.some((ug) => ug === g)));
        }

        // Remove groups if not requested
        if (!isTruthy(req.query.includeUserGroups)) {
          for (const user of userWithGroups) {
            delete user.group;
          }
        }
      }

      res.status(200).json(userWithGroups);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
