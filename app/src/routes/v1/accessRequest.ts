import express from 'express';
import { accessRequestController } from '../../controllers';
import { hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Resource } from '../../utils/enums/application';
import { accessRequestValidator } from '../../validators';

import type { NextFunction, Request, Response } from '../../interfaces/IExpress';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

// Request to create/revoke a user and access request - called by supervisor(201) & admin(200) when creating a user
router.post(
  '/',
  hasAuthorization(Resource.ACCESS_REQUEST, Action.CREATE),
  accessRequestValidator.createUserAccessRequest,
  (req: Request, res: Response, next: NextFunction): void => {
    accessRequestController.createUserAccessRequest(req, res, next);
  }
);

router.post(
  '/:accessRequestId',
  hasAuthorization(Resource.ACCESS_REQUEST, Action.UPDATE),
  accessRequestValidator.processUserAccessRequest,
  (req: Request, res: Response, next: NextFunction): void => {
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
