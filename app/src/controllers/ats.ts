import { atsService } from '../services';

import type { NextFunction, Request, Response } from 'express';
import type { ATSUserSearchParameters } from '../types';

const controller = {
  searchATSUsers: async (
    req: Request<never, never, never, ATSUserSearchParameters>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response = await atsService.searchATSUsers(req.query);

      res.status(response.status).json(response.data);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
