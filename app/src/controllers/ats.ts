import { atsService } from '../services.ts';

import { getCurrentUsername } from '../utils/utils.ts';

import type { NextFunction, Request, Response } from 'express';
import type { ATSClientResource, ATSUserSearchParameters } from '../types.ts';

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
      const identityProvider = req.currentContext?.tokenPayload?.identity_provider.toUpperCase();
      const atsClient = req.body;
      // Set the createdBy field to current user with \\ as the separator for the domain and username to match ATS DB
      atsClient.createdBy = `${identityProvider}\\${getCurrentUsername(req.currentContext)}`;
      const response = await atsService.createATSClient(atsClient);
      res.status(response.status).json(response.data);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
