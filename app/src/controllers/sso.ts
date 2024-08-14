import { ssoService } from '../services';

import type { NextFunction, Request, Response } from '../interfaces/IExpress';

const controller = {
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
