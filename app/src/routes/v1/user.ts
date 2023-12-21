import express from 'express';
import { userController } from '../../controllers';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';

import type { NextFunction, Request, Response } from 'express';

const router = express.Router();
router.use(requireSomeAuth);

// Submission endpoint
router.get('/', (req: Request, res: Response, next: NextFunction): void => {
  userController.searchUsers(req, res, next);
});

export default router;
