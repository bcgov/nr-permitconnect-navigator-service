import { yarsService } from '../services';

import type { NextFunction, Request, Response } from 'express';

const controller = {
  getGroups: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await yarsService.getGroups(req.currentContext.initiative);

      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  getPermissions: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const groups = await yarsService.getSubjectGroups(req.currentContext.tokenPayload?.sub as string);

      const permissions = await Promise.all(groups.map((x) => yarsService.getGroupPermissions(x.groupId))).then((x) =>
        x.flat()
      );

      res.status(200).json({ groups: groups.map((x) => x.groupName), permissions });
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
