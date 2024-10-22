import express from 'express';

import { atsController } from '../../controllers';
import { hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Resource } from '../../utils/enums/application';

import type { NextFunction, Request, Response } from 'express';
import type { ATSUserSearchParameters } from '../../types';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

router.get(
  '/clients',
  hasAuthorization(Resource.ATS, Action.READ),
  (req: Request<never, never, never, ATSUserSearchParameters>, res: Response, next: NextFunction): void => {
    atsController.searchATSUsers(req, res, next);
  }
);

export default router;
