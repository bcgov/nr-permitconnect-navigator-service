import express from 'express';

import { roadmapController } from '../../controllers/index.ts';
import { hasAuthorization } from '../../middleware/authorization.ts';
import { requireSomeAuth } from '../../middleware/requireSomeAuth.ts';
import { requireSomeGroup } from '../../middleware/requireSomeGroup.ts';
import { Action, Resource } from '../../utils/enums/application.ts';
import { roadmapValidator } from '../../validators/index.ts';

import type { NextFunction, Request, Response } from 'express';
import type { Email } from '../../types/index.ts';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

// Send an email with the roadmap data
router.put(
  '/',
  hasAuthorization(Resource.ROADMAP, Action.CREATE),
  roadmapValidator.send,
  (
    req: Request<never, never, { activityId: string; selectedFileIds: Array<string>; emailData: Email }>,
    res: Response,
    next: NextFunction
  ): void => {
    roadmapController.send(req, res, next);
  }
);

export default router;
