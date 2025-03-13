import express from 'express';

import { mapController } from '../../controllers';
import { hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Resource } from '../../utils/enums/application';

import type { NextFunction, Request, Response } from 'express';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

router.get(
  '/pids/:housingProjectId',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.READ),
  (req: Request<{ housingProjectId: string }>, res: Response, next: NextFunction): void => {
    mapController.getPIDs(req, res, next);
  }
);

export default router;
