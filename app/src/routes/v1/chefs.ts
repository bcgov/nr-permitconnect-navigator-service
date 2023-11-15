import express from 'express';
import { chefsController } from '../../controllers';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';

import type { NextFunction, Request, Response } from 'express';

const router = express.Router();
router.use(requireSomeAuth);

// Export submissions endpoint
router.get('/forms/:formId/export', (req: Request, res: Response, next: NextFunction): void => {
  chefsController.exportSubmissions(req, res, next);
});

// Form submissions endpoint
router.get('/forms/:formId/submissions', (req: Request, res: Response, next: NextFunction): void => {
  chefsController.getFormSubmissions(req, res, next);
});

// Published version endpoint
router.get('/forms/:formId/version', (req: Request, res: Response, next: NextFunction): void => {
  chefsController.getPublishedVersion(req, res, next);
});

// Submission endpoint
router.get('/submission/:formSubmissionId', (req: Request, res: Response, next: NextFunction): void => {
  chefsController.getSubmission(req, res, next);
});

// Version endpoint
router.get('/forms/:formId/versions/:versionId', (req: Request, res: Response, next: NextFunction): void => {
  chefsController.getVersion(req, res, next);
});

// Version fields endpoint
router.get('/forms/:formId/versions/:versionId/fields', (req: Request, res: Response, next: NextFunction): void => {
  chefsController.getVersionFields(req, res, next);
});

// Version submissions endpoint
router.get(
  '/forms/:formId/versions/:versionId/submissions',
  (req: Request, res: Response, next: NextFunction): void => {
    chefsController.getVersionSubmissions(req, res, next);
  }
);

export default router;
