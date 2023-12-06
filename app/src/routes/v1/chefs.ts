import express from 'express';
import { chefsController } from '../../controllers';
import { requireChefsFormConfigData } from '../../middleware/requireChefsFormConfigData';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';

import type { NextFunction, Request, Response } from 'express';

const router = express.Router();
router.use(requireSomeAuth);

// Submission endpoint
router.get('/export', (req: Request, res: Response, next: NextFunction): void => {
  chefsController.getFormExport(req, res, next);
});

// Submission endpoint
router.get(
  '/submission/:formSubmissionId',
  requireChefsFormConfigData,
  (req: Request, res: Response, next: NextFunction): void => {
    chefsController.getSubmission(req, res, next);
  }
);

export default router;
