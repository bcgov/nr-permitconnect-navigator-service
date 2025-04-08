import { reportingService } from '../services';

import type { NextFunction, Request, Response } from 'express';

const controller = {
  getElectrificationProjectPermitData: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await reportingService.getElectrificationProjectPermitData();
      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  getHousingProjectPermitData: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await reportingService.getHousingProjectPermitData();
      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
