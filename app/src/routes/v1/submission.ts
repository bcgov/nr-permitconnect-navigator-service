import express from 'express';
import { submissionController } from '../../controllers';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { submissionValidator } from '../../validators';

import type { NextFunction, Request, Response } from '../../interfaces/IExpress';

const router = express.Router();
router.use(requireSomeAuth);

// Submissions endpoint
router.get('/', (req: Request, res: Response, next: NextFunction): void => {
  submissionController.getSubmissions(req, res, next);
});

// Statistics endpoint
router.get(
  '/statistics',
  submissionValidator.getStatistics,
  (req: Request, res: Response, next: NextFunction): void => {
    submissionController.getStatistics(req, res, next);
  }
);

// Submission create endpoint
router.put('/', submissionValidator.createSubmission, (req: Request, res: Response, next: NextFunction): void => {
  submissionController.createSubmission(req, res, next);
});

router.get(
  '/:activityId',
  submissionValidator.getSubmission,
  (req: Request, res: Response, next: NextFunction): void => {
    submissionController.getSubmission(req, res, next);
  }
);

// Submission update endpoint
router.put(
  '/:submissionId',
  submissionValidator.updateSubmission,
  (req: Request, res: Response, next: NextFunction): void => {
    submissionController.updateSubmission(req, res, next);
  }
);

export default router;
