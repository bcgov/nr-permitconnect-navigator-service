import { permitService } from '../services';

import type { NextFunction, Request, Response } from '../interfaces/IExpress';
import type { Permit } from '../types';
import { generateCreateStamps, generateUpdateStamps } from '../db/utils/utils';

const controller = {
  createPermit: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await permitService.createPermit({
        ...(req.body as Permit),
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

  async listPermits(req: Request<{ activityId: string }>, res: Response, next: NextFunction) {
    try {
      const response = await permitService.listPermits(req.params.activityId);
      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  updatePermit: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await permitService.updatePermit({
        ...(req.body as Permit),
        ...generateUpdateStamps(req.currentContext)
      });
      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
