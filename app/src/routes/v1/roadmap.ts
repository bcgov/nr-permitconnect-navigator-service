import express from 'express';

import { roadmapController } from '../../controllers';
import { hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Resource } from '../../utils/enums/application';
import { roadmapValidator } from '../../validators';

import type { NextFunction, Request, Response } from 'express';
import type { Email } from '../../types';

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
