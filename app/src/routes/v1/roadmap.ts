import express from 'express';
import { roadmapController } from '../../controllers';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { roadmapValidator } from '../../validators';

import type { NextFunction, Request, Response } from '../../interfaces/IExpress';

const router = express.Router();
router.use(requireSomeAuth);

// update roadmap
router.put('/', roadmapValidator.update, (req: Request, res: Response, next: NextFunction): void => {
  roadmapController.update(req, res, next);
});

export default router;
