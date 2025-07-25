import { v4 as uuidv4 } from 'uuid';

import { generateUpdateStamps } from '../db/utils/utils';
import { permitService, permitTrackingService } from '../services';
import { isTruthy } from '../utils/utils';

import type { NextFunction, Request, Response } from 'express';
import type { ListPermitsOptions, Permit } from '../types';
import { Initiative } from '../utils/enums/application';

const controller = {
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

  getPermitTypes: async (
    req: Request<never, never, never, { initiative: Initiative }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response = await permitService.getPermitTypes(req.query.initiative);
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

  upsertPermit: async (req: Request<never, never, Permit>, res: Response, next: NextFunction) => {
    try {
      const permitDataWithId = {
        ...req.body,
        ...generateUpdateStamps(req.currentContext),
        permitId: req.body.permitId || uuidv4()
      };
      const response = await permitService.upsertPermit(permitDataWithId);
      await permitTrackingService.upsertPermitTracking(permitDataWithId);

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
