import { permitService } from '../services';

import type { NextFunction, Request, Response } from '../interfaces/IExpress';

const controller = {
  createPermit: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await permitService.createPermit(req.body);
      res.status(200).send(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  deletePermit: async (req: Request<{ permitId: string }>, res: Response, next: NextFunction) => {
    try {
      const response = await permitService.deletePermit(req.params.permitId);
      res.status(200).send(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  getPermitTypes: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await permitService.getPermitTypes();
      res.status(200).send(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  async listPermits(req: Request<{ submissionId: string }>, res: Response, next: NextFunction) {
    try {
      const response = await permitService.listPermits(req.params.submissionId);
      res.status(200).send(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  updatePermit: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await permitService.updatePermit(req.body);
      res.status(200).send(response);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
