import express from 'express';

import { submissionController } from '../../controllers';
import { hasAccess, hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Resource } from '../../utils/enums/application';
import { submissionValidator } from '../../validators';

import type { NextFunction, Request, Response } from 'express';
import type {
  Draft,
  Email,
  StatisticsFilters,
  Submission,
  SubmissionIntake,
  SubmissionSearchParameters
} from '../../types';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

/** Gets a list of submissions */
router.get(
  '/',
  hasAuthorization(Resource.SUBMISSION, Action.READ),
  (req: Request, res: Response, next: NextFunction): void => {
    submissionController.getSubmissions(req, res, next);
  }
);

/** Get a list of all the activityIds */
router.get(
  '/activityIds',
  hasAuthorization(Resource.SUBMISSION, Action.READ),
  (req: Request, res: Response, next: NextFunction): void => {
    submissionController.getActivityIds(req, res, next);
  }
);

/** Search submissions */
router.get(
  '/search',
  hasAuthorization(Resource.SUBMISSION, Action.READ),
  submissionValidator.searchSubmissions,
  (req: Request<never, never, never, SubmissionSearchParameters>, res: Response, next: NextFunction): void => {
    submissionController.searchSubmissions(req, res, next);
  }
);

/** Gets submission statistics*/
router.get(
  '/statistics',
  hasAuthorization(Resource.SUBMISSION, Action.READ),
  submissionValidator.getStatistics,
  (req: Request<never, never, never, StatisticsFilters>, res: Response, next: NextFunction): void => {
    submissionController.getStatistics(req, res, next);
  }
);

/** Gets a list of submission drafts */
router.get(
  '/draft/:draftId',
  hasAuthorization(Resource.SUBMISSION, Action.READ),
  hasAccess('draftId'),
  (req: Request<{ draftId: string }>, res: Response, next: NextFunction): void => {
    submissionController.getDraft(req, res, next);
  }
);

/** Gets a list of submission drafts */
router.get(
  '/draft',
  hasAuthorization(Resource.SUBMISSION, Action.READ),
  (req: Request, res: Response, next: NextFunction): void => {
    submissionController.getDrafts(req, res, next);
  }
);

/** Creates or updates an intake and set status to Draft */
router.put(
  '/draft',
  hasAuthorization(Resource.SUBMISSION, Action.CREATE),
  (req: Request<never, never, Draft>, res: Response, next: NextFunction): void => {
    submissionController.updateDraft(req, res, next);
  }
);

/** Creates or updates an intake and set status to Submitted */
router.put(
  '/draft/submit',
  hasAuthorization(Resource.SUBMISSION, Action.CREATE),
  submissionValidator.createSubmission,
  (req: Request<never, never, SubmissionIntake>, res: Response, next: NextFunction): void => {
    submissionController.submitDraft(req, res, next);
  }
);

// Send an email with the confirmation of submission
router.put(
  '/email',
  hasAuthorization(Resource.SUBMISSION, Action.CREATE),
  submissionValidator.emailConfirmation,
  (req: Request<never, never, Email>, res: Response, next: NextFunction): void => {
    submissionController.emailConfirmation(req, res, next);
  }
);

/** Creates a blank submission */
router.put(
  '/',
  hasAuthorization(Resource.SUBMISSION, Action.CREATE),
  submissionValidator.createSubmission,
  (req: Request<never, never, SubmissionIntake>, res: Response, next: NextFunction): void => {
    submissionController.createSubmission(req, res, next);
  }
);

/** Hard deletes a submission */
router.delete(
  '/:submissionId',
  hasAuthorization(Resource.SUBMISSION, Action.DELETE),
  hasAccess('submissionId'),
  submissionValidator.deleteSubmission,
  (req: Request<{ submissionId: string }>, res: Response, next: NextFunction): void => {
    submissionController.deleteSubmission(req, res, next);
  }
);

/** Hard deletes a submission draft */
router.delete(
  '/draft/:draftId',
  hasAuthorization(Resource.SUBMISSION, Action.DELETE),
  hasAccess('draftId'),
  submissionValidator.deleteDraft,
  (req: Request<{ draftId: string }>, res: Response, next: NextFunction): void => {
    submissionController.deleteDraft(req, res, next);
  }
);

/** Search all submissions */
router.get(
  '/search',
  (req: Request<never, never, never, SubmissionSearchParameters>, res: Response, next: NextFunction): void => {
    submissionController.searchSubmissions(req, res, next);
  }
);

/** Gets a specific submission */
router.get(
  '/:submissionId',
  hasAuthorization(Resource.SUBMISSION, Action.READ),
  //hasAccess('submissionId'), // TODO: Temp fix to check submittedBy in controller until we're off chefs
  submissionValidator.getSubmission,
  (req: Request<{ submissionId: string }>, res: Response, next: NextFunction): void => {
    submissionController.getSubmission(req, res, next);
  }
);

/** Updates a submission*/
router.put(
  '/:submissionId',
  hasAuthorization(Resource.SUBMISSION, Action.UPDATE),
  hasAccess('submissionId'),
  submissionValidator.updateSubmission,
  (req: Request<never, never, Submission>, res: Response, next: NextFunction): void => {
    submissionController.updateSubmission(req, res, next);
  }
);

/** Updates is_deleted flag for a submission */
router.patch(
  '/:submissionId/delete',
  hasAuthorization(Resource.SUBMISSION, Action.DELETE),
  hasAccess('submissionId'),
  submissionValidator.updateIsDeletedFlag,
  (req: Request<{ submissionId: string }, never, { isDeleted: boolean }>, res: Response, next: NextFunction): void => {
    submissionController.updateIsDeletedFlag(req, res, next);
  }
);

export default router;
