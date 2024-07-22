import { ssoService } from '../services';

import type { NextFunction, Request, Response } from '../interfaces/IExpress';

const controller = {
  requestBasicAccess: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await ssoService.requestBasicAccess((req.currentUser?.tokenPayload as any).preferred_username);
      res.status(response.status).json(response.data);
    } catch (e: unknown) {
      next(e);
    }
  },

  searchIdirUsers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await ssoService.searchIdirUsers(req.query);
      res.status(response.status).json(response.data);
    } catch (e: unknown) {
      next(e);
    }
  },

  searchBasicBceidUsers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await ssoService.searchBasicBceidUsers(req.query);
      res.status(response.status).json(response.data);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
