import express from 'express';
import { activityController } from '../../controllers';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';

import type { NextFunction, Request, Response } from 'express';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

//** Validates an Activity Id */
router.get('/validate/:activityId', (req: Request<{ activityId: string }>, res: Response, next: NextFunction): void => {
  activityController.validateActivityId(req, res, next);
});

export default router;
