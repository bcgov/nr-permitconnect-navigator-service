import express from 'express';
import { roadmapController } from '../../controllers';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { roadmapValidator } from '../../validators';

import type { NextFunction, Request, Response } from '../../interfaces/IExpress';

const router = express.Router();
router.use(requireSomeAuth);

// Send an email with the roadmap data
router.put('/', roadmapValidator.send, (req: Request, res: Response, next: NextFunction): void => {
  roadmapController.send(req, res, next);
});

export default router;
