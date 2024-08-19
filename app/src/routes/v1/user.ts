import express from 'express';

import { userController } from '../../controllers';
import { hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Resource } from '../../utils/enums/application';
import { userValidator } from '../../validators';

import type { NextFunction, Request, Response } from 'express';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

// Search users endpoint
router.get(
  '/',
  hasAuthorization(Resource.USER, Action.READ),
  userValidator.searchUsers,
  (req: Request, res: Response, next: NextFunction): void => {
    userController.searchUsers(req, res, next);
  }
);

export default router;
