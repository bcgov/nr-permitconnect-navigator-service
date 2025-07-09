import { sourceSystemKindService } from '../services';

import type { Request, Response, NextFunction } from 'express';

const controller = {
  getSourceSystemkinds: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await sourceSystemKindService.getSourceSystemkinds();
      res.status(200).json(response);
    } catch (e) {
      next(e);
    }
  }
};

export default controller;
