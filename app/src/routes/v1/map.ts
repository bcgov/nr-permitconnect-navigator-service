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

const INITIATIVE_RESOURCE_MAP = new Map<Initiative, Resource>([
  [Initiative.GENERAL, Resource.GENERAL_PROJECT],
  [Initiative.HOUSING, Resource.HOUSING_PROJECT]
]);

/** Get PIDs for a project */
router.get(
  '/pids/:projectId',
  async (req: Request, res: Response, next: NextFunction) => {
    const r = INITIATIVE_RESOURCE_MAP.get(req.currentContext.initiative);
    if (!r) {
      throw new Error('No resource');
    }
    return hasAuthorization(r, Action.READ)(req, res, next);
  },
  getPIDsController
);

export default router;
