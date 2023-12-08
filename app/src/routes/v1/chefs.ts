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

// Submission endpoint
router.put(
  '/submission/:formSubmissionId',
  requireChefsFormConfigData,
  (req: Request, res: Response, next: NextFunction): void => {
    chefsController.updateSubmission(req, res, next);
  }
);

// Submission status endpoint
router.get(
  '/submission/:formSubmissionId/status',
  requireChefsFormConfigData,
  (req: Request, res: Response, next: NextFunction): void => {
    chefsController.getSubmissionStatus(req, res, next);
  }
);

export default router;
