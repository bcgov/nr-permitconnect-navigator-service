import { generateCreateStamps } from '../db/utils/utils';
import { permitNoteService } from '../services';

import type { NextFunction, Request, Response } from 'express';
import type { PermitNote } from '../types';

const controller = {
  createPermitNote: async (req: Request<never, never, PermitNote>, res: Response, next: NextFunction) => {
    try {
      const response = await permitNoteService.createPermitNote({
        ...req.body,
        ...generateCreateStamps(req.currentContext)
      });
      res.status(201).json(response);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
