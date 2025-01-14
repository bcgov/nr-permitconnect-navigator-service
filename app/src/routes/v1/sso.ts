import express from 'express';

import { ssoController } from '../../controllers/index.ts';
import { hasAuthorization } from '../../middleware/authorization.ts';
import { requireSomeAuth } from '../../middleware/requireSomeAuth.ts';
import { requireSomeGroup } from '../../middleware/requireSomeGroup.ts';
import { Action, Resource } from '../../utils/enums/application.ts';

import type { NextFunction, Request, Response } from 'express';
import type { BceidSearchParameters, IdirSearchParameters } from '../../types/index.ts';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

router.get(
  '/idir/users',
  hasAuthorization(Resource.SSO, Action.READ),
  (req: Request<never, never, never, IdirSearchParameters>, res: Response, next: NextFunction): void => {
    ssoController.searchIdirUsers(req, res, next);
  }
);

router.get(
  '/basic-bceid/users',
  hasAuthorization(Resource.SSO, Action.READ),
  (req: Request<never, never, never, BceidSearchParameters>, res: Response, next: NextFunction): void => {
    ssoController.searchBasicBceidUsers(req, res, next);
  }
);

export default router;
