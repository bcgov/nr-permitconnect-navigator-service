import express from 'express';
import { accessRequestController } from '../../controllers/index.ts';
import { hasAuthorization } from '../../middleware/authorization.ts';
import { requireSomeAuth } from '../../middleware/requireSomeAuth.ts';
import { requireSomeGroup } from '../../middleware/requireSomeGroup.ts';
import { Action, Resource } from '../../utils/enums/application.ts';
import { accessRequestValidator } from '../../validators/index.ts';

import type { NextFunction, Request, Response } from 'express';
import type { AccessRequest, User } from '../../types/index.ts';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

// Request to create/revoke a user and access request - called by supervisor(201) & admin(200) when creating a user
router.post(
  '/',
  hasAuthorization(Resource.ACCESS_REQUEST, Action.CREATE),
  accessRequestValidator.createUserAccessRequest,
  (
    req: Request<never, never, { accessRequest: AccessRequest; user: User }>,
    res: Response,
    next: NextFunction
  ): void => {
    accessRequestController.createUserAccessRequest(req, res, next);
  }
);

router.post(
  '/:accessRequestId',
  hasAuthorization(Resource.ACCESS_REQUEST, Action.UPDATE),
  accessRequestValidator.processUserAccessRequest,
  (req: Request<{ accessRequestId: string }, never, { approve: boolean }>, res: Response, next: NextFunction): void => {
    accessRequestController.processUserAccessRequest(req, res, next);
  }
);

router.get(
  '/',
  hasAuthorization(Resource.ACCESS_REQUEST, Action.READ),
  (req: Request, res: Response, next: NextFunction): void => {
    accessRequestController.getAccessRequests(req, res, next);
  }
);

export default router;
