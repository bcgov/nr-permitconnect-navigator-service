import express from 'express';

import { yarsController } from '../../controllers';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';

import type { NextFunction, Request, Response } from '../../interfaces/IExpress';

const router = express.Router();
router.use(requireSomeAuth);

router.get('/permissions', (req: Request, res: Response, next: NextFunction): void => {
  yarsController.getPermissions(req, res, next);
});

export default router;
