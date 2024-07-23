import { yarsService } from '../services';

import type { NextFunction, Request, Response } from '../interfaces/IExpress';

const controller = {
  getPermissions: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const roles = await yarsService.getIdentityRoles((req.currentUser?.tokenPayload as any).preferred_username);

      const permissions = await Promise.all(roles.map((x) => yarsService.getRolePermissions(x.roleId))).then((x) =>
        x.flat()
      );

      res.status(200).json(permissions);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
