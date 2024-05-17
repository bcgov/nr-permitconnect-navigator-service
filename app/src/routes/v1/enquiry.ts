import express from 'express';
import { enquiryController } from '../../controllers';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';

import type { NextFunction, Request, Response } from '../../interfaces/IExpress';

const router = express.Router();
router.use(requireSomeAuth);

// Submission create draft endpoint
router.put('/draft', (req: Request, res: Response, next: NextFunction): void => {
  enquiryController.createDraft(req, res, next);
});

// Submission update draft endpoint
router.put('/draft/:activityId', (req: Request, res: Response, next: NextFunction): void => {
  enquiryController.updateDraft(req, res, next);
});

export default router;
