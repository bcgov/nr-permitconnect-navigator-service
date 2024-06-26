import { userService } from '../services';
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
        username: req.query.username as string,
        email: req.query.email as string,
        firstName: req.query.firstName as string,
        fullName: req.query.fullName as string,
        lastName: req.query.lastName as string,
        active: isTruthy(req.query.active as string)
      });
      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
