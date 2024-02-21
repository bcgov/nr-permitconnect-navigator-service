import express from 'express';
import { userController } from '../../controllers';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { userValidator } from '../../validators';

import type { NextFunction, Request, Response } from 'express';

const router = express.Router();
router.use(requireSomeAuth);

// Submission endpoint
router.get('/', userValidator.searchUsers, (req: Request, res: Response, next: NextFunction): void => {
  userController.searchUsers(req, res, next);
});

export default router;
