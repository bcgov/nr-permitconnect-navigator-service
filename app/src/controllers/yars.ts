import { yarsService } from '../services';

import type { NextFunction, Request, Response } from '../interfaces/IExpress';

const controller = {
  getPermissions: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const groups = await yarsService.getIdentityGroups((req.currentContext?.tokenPayload as any).preferred_username);

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
