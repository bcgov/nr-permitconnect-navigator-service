import { generateCreateStamps, generateUpdateStamps } from '../db/utils/utils';
import { permitService } from '../services';
import { isTruthy } from '../utils/utils';

import type { NextFunction, Request, Response } from 'express';
import type { ListPermitsOptions, Permit } from '../types';

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

      if (!response) {
        return res.status(404).json({ message: 'Permit not found' });
      }

      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  getPermit: async (req: Request<{ permitId: string }>, res: Response, next: NextFunction) => {
    try {
      const response = await permitService.getPermit(req.params.permitId);

      if (!response) {
        return res.status(404).json({ message: 'Permit not found' });
      }

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

  async listPermits(req: Request<never, never, never, Partial<ListPermitsOptions>>, res: Response, next: NextFunction) {
    try {
      const options: ListPermitsOptions = {
        ...req.query,
        includeNotes: isTruthy(req.query.includeNotes)
      };

      const response = await permitService.listPermits(options);
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

      if (!response) {
        return res.status(404).json({ message: 'Permit not found' });
      }

      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
