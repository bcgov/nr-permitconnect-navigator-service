import { yarsService } from '../services';
import { Initiative } from '../utils/enums/application';

import type { NextFunction, Request, Response } from 'express';

const controller = {
  getGroups: async (
    req: Request<never, never, never, { initiative: Initiative }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response = await yarsService.getGroups(req.query.initiative);

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

      res.status(200).json({ groups: groups, permissions });
    } catch (e: unknown) {
      next(e);
    }
  },

  deleteSubjectGroup: async (
    req: Request<never, never, { sub: string; groupId: number }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response = await yarsService.removeGroup(req.body.sub, req.body.groupId);

      if (!response) {
        return res.status(422).json({ message: 'Unable to process revocation.' });
      }
      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
