import express from 'express';

import { yarsController } from '../../controllers';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';

import type { NextFunction, Request, Response } from 'express';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

router.get('/groups', (req: Request, res: Response, next: NextFunction): void => {
  yarsController.getGroups(req, res, next);
});

router.get('/permissions', (req: Request, res: Response, next: NextFunction): void => {
  yarsController.getPermissions(req, res, next);
});

export default router;
