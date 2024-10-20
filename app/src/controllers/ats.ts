import { atsService } from '../services';

import { IdentityProvider } from '../utils/enums/application';
import { getCurrentUsername } from '../utils/utils';

import type { NextFunction, Request, Response } from 'express';
import type { ATSClientResource, ATSUserSearchParameters } from '../types';

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
  },

  createATSClient: async (req: Request<never, never, ATSClientResource, never>, res: Response, next: NextFunction) => {
    try {
      const atsClient = req.body;
      atsClient.createdBy = `${IdentityProvider.IDIR.toUpperCase()}\\${getCurrentUsername(req.currentContext)}`;
      const response = await atsService.createATSClient(atsClient);
      res.status(response.status).json(response.data);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
