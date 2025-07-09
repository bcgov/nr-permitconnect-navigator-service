import { sourceSystemKindService } from '../services';

import type { Request, Response, NextFunction } from 'express';

const controller = {
  getSourceSystemKinds: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await sourceSystemKindService.getSourceSystemKinds();
      res.status(200).json(response);
    } catch (e) {
      next(e);
    }
  }
};

export default controller;
