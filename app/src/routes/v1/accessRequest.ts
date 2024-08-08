import express from 'express';
import { accessRequestController } from '../../controllers';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { accessRequestValidator } from '../../validators';

import type { NextFunction, Request, Response } from 'express';

const router = express.Router();
router.use(requireSomeAuth);

// Request to create/revoke a user and access request - called by supervisor(201) & admin(200)
router.post(
  '/',
  accessRequestValidator.userAccessRevokeRequest,
  (req: Request, res: Response, next: NextFunction): void => {
    accessRequestController.createUserAccessRevokeRequest(req, res, next);
  }
);

// Approve/Deny access/revoke request - called by admin (200)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
router.patch('/', (req: Request, res: Response, next: NextFunction): void => {
  // TODO: approve/deny access request
});

router.get('/', (req: Request, res: Response, next: NextFunction): void => {
  accessRequestController.getAccessRequests(req, res, next);
});

export default router;
