import express from 'express';
import { accessRequestController } from '../../controllers';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { accessRequestValidator } from '../../validators';

import type { NextFunction, Request, Response } from '../../interfaces/IExpress';

const router = express.Router();
router.use(requireSomeAuth);

// Request to create/revoke a user and access request - called by supervisor(201) & admin(200) when creating a user
router.post(
  '/',
  accessRequestValidator.userAccessRevokeRequest,
  (req: Request, res: Response, next: NextFunction): void => {
    accessRequestController.createUserAccessRevokeRequest(req, res, next);
  }
);

// Approve/Deny access/revoke request - called by admin (200)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// router.patch('/', (req: Request, res: Response, next: NextFunction): void => {
//   // TODO: approve/deny access request
// });

// Update role - called by admin & supervisor when updating roles for an existing navigator/read-only
// called by admin for approving a user to become navigator/read-only
// called by admin when revoking a user
// called by admin after creating a new user to assign the correct roles
// eslint-disable-next-line @typescript-eslint/no-unused-vars
router.put('/role', (req: Request, res: Response, next: NextFunction): void => {
  // TODO: approve/deny access request
});

// Delete access request if present - called by admin
// Request called by admin after approving/revoke request and for denying access/revoke request - 4 operations
// eslint-disable-next-line @typescript-eslint/no-unused-vars
router.delete('/:accessRequestId', (req: Request, res: Response, next: NextFunction): void => {
  // TODO: delete access request entry
  accessRequestController.deleteAccessRequests(req, res, next);
});

router.get('/', (req: Request, res: Response, next: NextFunction): void => {
  accessRequestController.getAccessRequests(req, res, next);
});

export default router;
