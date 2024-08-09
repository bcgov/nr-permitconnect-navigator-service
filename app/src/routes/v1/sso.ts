import express from 'express';

import { ssoController } from '../../controllers';
import { hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { Action, Resource } from '../../utils/enums/application';

import type { NextFunction, Request, Response } from '../../interfaces/IExpress';

const router = express.Router();
router.use(requireSomeAuth);

router.post('/requestBasicAccess', (req: Request, res: Response, next: NextFunction): void => {
  ssoController.requestBasicAccess(req, res, next);
});

router.get(
  '/idir/users',
  hasAuthorization(Resource.SSO, Action.READ),
  (req: Request, res: Response, next: NextFunction): void => {
    ssoController.searchIdirUsers(req, res, next);
  }
);

router.get(
  '/basic-bceid/users',
  hasAuthorization(Resource.SSO, Action.READ),
  (req: Request, res: Response, next: NextFunction): void => {
    ssoController.searchBasicBceidUsers(req, res, next);
  }
);

export default router;
