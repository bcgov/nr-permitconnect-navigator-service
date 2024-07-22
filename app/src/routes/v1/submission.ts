import express from 'express';
import { submissionController } from '../../controllers';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { submissionValidator } from '../../validators';

import type { NextFunction, Request, Response } from '../../interfaces/IExpress';
import { hasPermission } from '../../middleware/authorization';
import { Action, Resource } from '../../utils/enums/application';

const router = express.Router();
router.use(requireSomeAuth);

/** Gets a list of submissions */
router.get(
  '/',
  hasPermission(Resource.SUBMISSION, Action.READ),
  (req: Request, res: Response, next: NextFunction): void => {
    submissionController.getSubmissions(req, res, next);
  }
);

/** Get a list of all the activityIds */
router.get('/activityIds', (req: Request, res: Response, next: NextFunction): void => {
  submissionController.getActivityIds(req, res, next);
});

/** Search submissions */
router.get(
  '/search',
  hasPermission(Resource.SUBMISSION, Action.READ),
  submissionValidator.searchSubmissions,
  (req: Request, res: Response, next: NextFunction): void => {
    submissionController.searchSubmissions(req, res, next);
  }
);

/** Gets submission statistics*/
router.get(
  '/statistics',
  hasPermission(Resource.SUBMISSION, Action.READ),
  submissionValidator.getStatistics,
  (req: Request, res: Response, next: NextFunction): void => {
    submissionController.getStatistics(req, res, next);
  }
);

/** Creates a submission with Draft status */
router.put(
  '/draft',
  hasPermission(Resource.SUBMISSION, Action.CREATE),
  (req: Request, res: Response, next: NextFunction): void => {
    submissionController.createDraft(req, res, next);
  }
);

/** Updates a submission with Draft status */
router.put(
  '/draft/:submissionId',
  hasPermission(Resource.SUBMISSION, Action.UPDATE),
  (req: Request, res: Response, next: NextFunction): void => {
    submissionController.updateDraft(req, res, next);
  }
);

// Send an email with the confirmation of submission
router.put(
  '/emailConfirmation',
  hasPermission(Resource.SUBMISSION, Action.CREATE),
  submissionValidator.emailConfirmation,
  (req: Request, res: Response, next: NextFunction): void => {
    submissionController.emailConfirmation(req, res, next);
  }
);

/** Creates a submission */
router.put(
  '/',
  hasPermission(Resource.SUBMISSION, Action.CREATE),
  submissionValidator.createSubmission,
  (req: Request, res: Response, next: NextFunction): void => {
    submissionController.createSubmission(req, res, next);
  }
);

/** Deletes a submission */
router.delete(
  '/:submissionId',
  hasPermission(Resource.SUBMISSION, Action.DELETE),
  submissionValidator.deleteSubmission,
  (req: Request, res: Response, next: NextFunction): void => {
    submissionController.deleteSubmission(req, res, next);
  }
);

/** Gets a specific submission */
router.get('/search', (req: Request, res: Response, next: NextFunction): void => {
  submissionController.searchSubmissions(req, res, next);
});
router.get(
  '/:submissionId',
  hasPermission(Resource.SUBMISSION, Action.READ),
  submissionValidator.getSubmission,
  (req: Request, res: Response, next: NextFunction): void => {
    submissionController.getSubmission(req, res, next);
  }
);

/** Updates a submission*/
router.put(
  '/:submissionId',
  hasPermission(Resource.SUBMISSION, Action.UPDATE),
  submissionValidator.updateSubmission,
  (req: Request, res: Response, next: NextFunction): void => {
    submissionController.updateSubmission(req, res, next);
  }
);

/** Updates is_deleted flag for a submission */
router.patch(
  '/:submissionId/delete',
  hasPermission(Resource.SUBMISSION, Action.DELETE),
  submissionValidator.updateIsDeletedFlag,
  (req: Request, res: Response, next: NextFunction): void => {
    submissionController.updateIsDeletedFlag(req, res, next);
  }
);

export default router;
