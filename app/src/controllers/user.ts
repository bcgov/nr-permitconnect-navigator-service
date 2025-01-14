import { userService, yarsService } from '../services.ts';
import { User, UserSearchParameters } from '../types.ts';
import { GroupName } from '../utils/enums/application.ts';
import { addDashesToUuid, mixedQueryToArray, isTruthy } from '../utils/utils.ts';

import type { NextFunction, Request, Response } from 'express';

const controller = {
  searchUsers: async (req: Request<never, never, never, UserSearchParameters>, res: Response, next: NextFunction) => {
    try {
      const reqGroup = mixedQueryToArray(req.query.group) as GroupName[];
      const userIds = mixedQueryToArray(req.query.userId);

      const response = await userService.searchUsers({
        userId: userIds ? userIds.map((id) => addDashesToUuid(id)) : userIds,
        identityId: mixedQueryToArray(req.query.identityId),
        idp: mixedQueryToArray(req.query.idp),
        sub: req.query.sub,
        email: req.query.email,
        firstName: req.query.firstName,
        fullName: req.query.fullName,
        lastName: req.query.lastName,
        active: isTruthy(req.query.active)
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
          userWithGroups = userWithGroups.filter((user) => reqGroup.some((g) => user.groups?.some((ug) => ug === g)));
        }

        // Remove groups if not requested
        if (!isTruthy(req.query.includeUserGroups)) {
          for (const user of userWithGroups) {
            delete user.groups;
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
