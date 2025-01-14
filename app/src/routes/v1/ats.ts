import express from 'express';

import { atsController } from '../../controllers/index.ts';
import { hasAuthorization } from '../../middleware/authorization.ts';
import { requireSomeAuth } from '../../middleware/requireSomeAuth.ts';
import { requireSomeGroup } from '../../middleware/requireSomeGroup.ts';
import { Action, Resource } from '../../utils/enums/application.ts';
import { atsValidator } from '../../validators/index.ts';

import type { NextFunction, Request, Response } from 'express';
import type { ATSClientResource, ATSUserSearchParameters } from '../../types/index.ts';

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

/** Creates a client in ATS */
router.post(
  '/client',
  hasAuthorization(Resource.ATS, Action.CREATE),
  atsValidator.createATSClient,
  (req: Request<never, never, ATSClientResource, never>, res: Response, next: NextFunction): void => {
    atsController.createATSClient(req, res, next);
  }
);

export default router;
