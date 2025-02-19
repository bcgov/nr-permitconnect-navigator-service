import { reportingService } from '../services';

import type { NextFunction, Request, Response } from 'express';

const controller = {
  getSubmissionPermitData: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await reportingService.getSubmissionPermitData();
      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
