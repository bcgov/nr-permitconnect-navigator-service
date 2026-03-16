import express from 'express';

import { getPIDsController } from '../../controllers/map.ts';
import { hasAuthorization } from '../../middleware/authorization.ts';
import { requireSomeAuth } from '../../middleware/requireSomeAuth.ts';
import { requireSomeGroup } from '../../middleware/requireSomeGroup.ts';
import { Action, Initiative, Resource } from '../../utils/enums/application.ts';

import type { NextFunction, Request, Response } from 'express';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

/** Get PIDs for a housing project */
router.get(
  '/pids/:projectId',
  async (req: Request, res: Response, next: NextFunction) => {
    return hasAuthorization(
      req.currentContext.initiative === Initiative.HOUSING ? Resource.HOUSING_PROJECT : Resource.GENERAL_PROJECT,
      Action.READ
    )(req, res, next);
  },
  getPIDsController
);

export default router;
