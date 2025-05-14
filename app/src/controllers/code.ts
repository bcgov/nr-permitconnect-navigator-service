import { codeService } from '../services';

import type { Request, Response, NextFunction } from 'express';

const controller = {
  listAllCodeTables: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await codeService.listAllCodeTables();
      res.status(200).json(response);
    } catch (e) {
      next(e);
    }
  }
};

export default controller;
