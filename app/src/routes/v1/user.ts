import express from 'express';

import { userController } from '../../controllers/index.ts';
import { hasAuthorization } from '../../middleware/authorization.ts';
import { requireSomeAuth } from '../../middleware/requireSomeAuth.ts';
import { requireSomeGroup } from '../../middleware/requireSomeGroup.ts';
import { Action, Resource } from '../../utils/enums/application.ts';
import { userValidator } from '../../validators/index.ts';

import type { NextFunction, Request, Response } from 'express';
import type { UserSearchParameters } from '../../types/index.ts';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

// Search users endpoint
router.get(
  '/',
  hasAuthorization(Resource.USER, Action.READ),
  userValidator.searchUsers,
  (req: Request<never, never, never, UserSearchParameters>, res: Response, next: NextFunction): void => {
    userController.searchUsers(req, res, next);
  }
);

export default router;
