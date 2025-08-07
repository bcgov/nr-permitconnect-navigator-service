import { getSourceSystemKinds } from '../services/sourceSystemKind';

import type { Request, Response, NextFunction } from 'express';

const controller = {
  getSourceSystemKinds: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await getSourceSystemKinds();
      res.status(200).json(response);
    } catch (e) {
      next(e);
    }
  }
};

export default controller;
