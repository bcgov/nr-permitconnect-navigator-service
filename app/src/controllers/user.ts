import { userService } from '../services';
import { GroupName } from '../utils/enums/application';
import { addDashesToUuid, mixedQueryToArray, isTruthy } from '../utils/utils';

import type { NextFunction, Request, Response } from 'express';

const controller = {
  searchUsers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userIds = mixedQueryToArray(req.query.userId as string);

      const response = await userService.searchUsers({
        userId: userIds ? userIds.map((id) => addDashesToUuid(id)) : userIds,
        identityId: mixedQueryToArray(req.query.identityId as string),
        idp: mixedQueryToArray(req.query.idp as string),
        sub: req.query.username as string,
        email: req.query.email as string,
        firstName: req.query.firstName as string,
        fullName: req.query.fullName as string,
        lastName: req.query.lastName as string,
        active: isTruthy(req.query.active as string)
      });

      if (
        req.query.role &&
        [GroupName.NAVIGATOR, GroupName.NAVIGATOR_READ_ONLY].includes(req.query.role as GroupName)
      ) {
        // TODO: filter out uses without a role of NAVIGATOR|NAVIGATOR_READ_ONLY or a pending access request from the response
      }

      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
