import { ssoService } from '../services';

import type { NextFunction, Request, Response } from 'express';
import type { BceidSearchParameters, IdirSearchParameters } from '../types';

const controller = {
  searchIdirUsers: async (
    req: Request<never, never, never, IdirSearchParameters>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response = await ssoService.searchIdirUsers(req.query);
      res.status(response.status).json(response.data);
    } catch (e: unknown) {
      next(e);
    }
  },

  searchBasicBceidUsers: async (
    req: Request<never, never, never, BceidSearchParameters>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response = await ssoService.searchBasicBceidUsers(req.query);
      res.status(response.status).json(response.data);
    } catch (e: unknown) {
      next(e);
    }
  },

  searchBusinessBceidUsers: async (
    req: Request<never, never, never, BceidSearchParameters>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response = await ssoService.searchBusinessBceidUsers(req.query);
      res.status(response.status).json(response.data);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
