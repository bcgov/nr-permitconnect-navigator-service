import express from 'express';

import { roadmapController } from '../../controllers';
import { hasPermission } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { Action, Resource } from '../../utils/enums/application';
import { roadmapValidator } from '../../validators';

import type { NextFunction, Request, Response } from '../../interfaces/IExpress';

const router = express.Router();
router.use(requireSomeAuth);

// Send an email with the roadmap data
router.put(
  '/',
  hasPermission(Resource.ROADMAP, Action.CREATE),
  roadmapValidator.send,
  (req: Request, res: Response, next: NextFunction): void => {
    roadmapController.send(req, res, next);
  }
);

export default router;
