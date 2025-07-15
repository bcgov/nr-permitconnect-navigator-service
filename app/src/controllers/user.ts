import { initiativeService, userService, yarsService } from '../services';
import { Group, User, UserSearchParameters } from '../types';
import { GroupName, Initiative } from '../utils/enums/application';
import { addDashesToUuid, mixedQueryToArray, isTruthy } from '../utils/utils';

import type { NextFunction, Request, Response } from 'express';

const controller = {
  searchUsers: async (req: Request<never, never, never, UserSearchParameters>, res: Response, next: NextFunction) => {
    try {
      const reqGroup = mixedQueryToArray(req.query.group) as GroupName[];
      const reqInitiative = mixedQueryToArray(req.query.initiative) as Initiative[];
      const userIds = mixedQueryToArray(req.query.userId);

      const response = await userService.searchUsers({
        userId: userIds ? userIds.map((id) => addDashesToUuid(id)) : userIds,
        idp: mixedQueryToArray(req.query.idp),
        sub: req.query.sub,
        email: req.query.email,
        firstName: req.query.firstName,
        fullName: req.query.fullName,
        lastName: req.query.lastName,
        active: isTruthy(req.query.active)
      });

      type UserWithGroup = User & { groups?: Array<Group> };

      // Inject found users with their groups if necessary
      let userWithGroups: UserWithGroup[] = response;

      if (reqGroup?.length || isTruthy(req.query.includeUserGroups)) {
        for (const user of userWithGroups) {
          user.groups = await yarsService.getSubjectGroups(user.sub);
        }

        // Filters users based on groups
        if (reqGroup?.length) {
          userWithGroups = userWithGroups.filter((user) =>
            reqGroup.some((g) => user.groups?.some((ug) => ug.name === g))
          );
        }

        // Filters user groups based on initiative
        if (reqInitiative?.length) {
          const initiative = (await Promise.all(reqInitiative.map((i) => initiativeService.getInitiative(i)))).flatMap(
            (r) => r
          );
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

      res.status(200).json(userWithGroups);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
