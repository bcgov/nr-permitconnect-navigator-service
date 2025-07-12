import { generateCreateStamps, generateUpdateStamps } from '../db/utils/utils';
import { permitService } from '../services';
import { Initiative } from '../utils/enums/application';
import { isTruthy } from '../utils/utils';

import type { NextFunction, Request, Response } from 'express';
import type { ListPermitsOptions, Permit, PermitType, PermitWithRelations, PermitWithType } from '../types';

const controller = {
  createPermit: async (req: Request<never, never, Permit>, res: Response, next: NextFunction) => {
    try {
      const response: PermitWithRelations = await permitService.createPermit({
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
      const response: PermitWithType = await permitService.deletePermit(req.params.permitId);

      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  getPermit: async (req: Request<{ permitId: string }>, res: Response, next: NextFunction) => {
    try {
      const response: PermitWithRelations = await permitService.getPermit(req.params.permitId);

      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  listPermits: async (
    req: Request<never, never, never, Partial<ListPermitsOptions>>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const options: ListPermitsOptions = {
        ...req.query,
        includeNotes: isTruthy(req.query.includeNotes)
      };

      const response: PermitWithRelations[] = await permitService.listPermits(options);

      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  listPermitTypes: async (
    req: Request<never, never, never, { initiative: Initiative }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response: PermitType[] = await permitService.listPermitTypes(req.query.initiative);

      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  upsertPermit: async (req: Request<never, never, Permit>, res: Response, next: NextFunction) => {
    try {
      const response: PermitWithType = await permitService.updatePermit({
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
