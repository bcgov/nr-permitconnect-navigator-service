import { generateCreateStamps, generateUpdateStamps } from '../db/utils/utils';
import { permitService } from '../services';

import type { NextFunction, Request, Response } from 'express';
import type { Permit } from '../types';

const controller = {
  createPermit: async (req: Request<never, never, Permit>, res: Response, next: NextFunction) => {
    try {
      const response = await permitService.createPermit({
        ...req.body,
        ...generateCreateStamps(req.currentContext),
        ...generateUpdateStamps(req.currentContext)
      });
      res.status(201).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  deletePermit: async (req: Request<{ permitId: string }>, res: Response, next: NextFunction) => {
    try {
      const response = await permitService.deletePermit(req.params.permitId);
      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  getPermitTypes: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await permitService.getPermitTypes();
      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  async listPermits(req: Request<never, never, never, { activityId?: string }>, res: Response, next: NextFunction) {
    try {
      const response = await permitService.listPermits(req.query?.activityId);
      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  updatePermit: async (req: Request<never, never, Permit>, res: Response, next: NextFunction) => {
    try {
      const response = await permitService.updatePermit({
        ...req.body,
        ...generateUpdateStamps(req.currentContext)
      });
      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
