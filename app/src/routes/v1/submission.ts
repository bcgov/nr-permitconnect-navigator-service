import express from 'express';
import { submissionController } from '../../controllers';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';

import type { NextFunction, Request, Response } from '../../interfaces/IExpress';

const router = express.Router();
router.use(requireSomeAuth);

// Submissions endpoint
router.get('/', (req: Request, res: Response, next: NextFunction): void => {
  submissionController.getSubmissions(req, res, next);
});

// Statistics endpoint
router.get('/statistics', (req: Request, res: Response, next: NextFunction): void => {
  submissionController.getStatistics(req, res, next);
});

// Submission endpoint
router.get('/:submissionId', (req: Request, res: Response, next: NextFunction): void => {
  submissionController.getSubmission(req, res, next);
});

// Submission update endpoint
router.put('/:submissionId', (req: Request, res: Response, next: NextFunction): void => {
  submissionController.updateSubmission(req, res, next);
});

export default router;
