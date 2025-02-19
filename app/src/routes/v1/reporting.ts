import express from 'express';

import { reportingController } from '../../controllers';
import { hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Resource } from '../../utils/enums/application';

import type { NextFunction, Request, Response } from 'express';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

/** Get all submission and permit data for csv download */
router.get(
  '/submission/permit',
  hasAuthorization(Resource.REPORTING, Action.READ),
  (req: Request, res: Response, next: NextFunction): void => {
    reportingController.getSubmissionPermitData(req, res, next);
  }
);

export default router;
