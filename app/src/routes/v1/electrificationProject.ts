import express from 'express';

import { electrificationProjectController } from '../../controllers';
import { hasAccess, hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Resource } from '../../utils/enums/application';
import { electrificationProjectValidator } from '../../validators';

import type { NextFunction, Request, Response } from 'express';
import type {
  Draft,
  Email,
  StatisticsFilters,
  ElectrificationProject,
  ElectrificationProjectIntake,
  ElectrificationProjectSearchParameters,
  Contact
} from '../../types';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

/** Gets a list of electrification projects */
router.get(
  '/',
  hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.READ),
  (req: Request, res: Response, next: NextFunction): void => {
    electrificationProjectController.getElectrificationProjects(req, res, next);
  }
);

/** Get a list of all the activityIds */
router.get(
  '/activityIds',
  hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.READ),
  (req: Request, res: Response, next: NextFunction): void => {
    electrificationProjectController.getActivityIds(req, res, next);
  }
);

/** Search electrification projects */
router.get(
  '/search',
  hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.READ),
  electrificationProjectValidator.searcElectrificationProjects,
  (
    req: Request<never, never, never, ElectrificationProjectSearchParameters>,
    res: Response,
    next: NextFunction
  ): void => {
    electrificationProjectController.searchElectrificationProjects(req, res, next);
  }
);

/** Gets electrification project statistics*/
router.get(
  '/statistics',
  hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.READ),
  electrificationProjectValidator.getStatistics,
  (req: Request<never, never, never, StatisticsFilters>, res: Response, next: NextFunction): void => {
    electrificationProjectController.getStatistics(req, res, next);
  }
);

/** Gets a list of electrification project drafts */
router.get(
  '/draft/:draftId',
  hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.READ),
  hasAccess('draftId'),
  (req: Request<{ draftId: string }>, res: Response, next: NextFunction): void => {
    electrificationProjectController.getDraft(req, res, next);
  }
);

/** Gets a electrification project draft */
router.get(
  '/draft',
  hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.READ),
  (req: Request, res: Response, next: NextFunction): void => {
    electrificationProjectController.getDrafts(req, res, next);
  }
);

/** Creates or updates an intake and set status to Draft */
router.put(
  '/draft',
  hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.CREATE),
  (req: Request<never, never, Draft>, res: Response, next: NextFunction): void => {
    electrificationProjectController.updateDraft(req, res, next);
  }
);

/** Creates or updates an intake and set status to Submitted */
router.put(
  '/draft/submit',
  hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.CREATE),
  electrificationProjectValidator.createElectrificationProject,
  (req: Request<never, never, ElectrificationProjectIntake>, res: Response, next: NextFunction): void => {
    electrificationProjectController.submitDraft(req, res, next);
  }
);

// Send an email with the confirmation of electrification project
router.put(
  '/email',
  hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.CREATE),
  electrificationProjectValidator.emailConfirmation,
  (req: Request<never, never, Email>, res: Response, next: NextFunction): void => {
    electrificationProjectController.emailConfirmation(req, res, next);
  }
);

/** Creates a blank electrification project */
router.put(
  '/',
  hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.CREATE),
  electrificationProjectValidator.createElectrificationProject,
  (req: Request<never, never, ElectrificationProjectIntake>, res: Response, next: NextFunction): void => {
    electrificationProjectController.createElectrificationProject(req, res, next);
  }
);

/** Hard deletes a electrification project */
router.delete(
  '/:electrificationProjectId',
  hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.DELETE),
  hasAccess('electrificationProjectId'),
  electrificationProjectValidator.deleteElectrificationProject,
  (req: Request<{ electrificationProjectId: string }>, res: Response, next: NextFunction): void => {
    electrificationProjectController.deleteElectrificationProject(req, res, next);
  }
);

/** Hard deletes a electrification project draft */
router.delete(
  '/draft/:draftId',
  hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.DELETE),
  hasAccess('draftId'),
  electrificationProjectValidator.deleteDraft,
  (req: Request<{ draftId: string }>, res: Response, next: NextFunction): void => {
    electrificationProjectController.deleteDraft(req, res, next);
  }
);

/** Gets a specific electrification project */
router.get(
  '/:electrificationProjectId',
  hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.READ),
  //hasAccess('electrificationProjectId'), // TODO: Temp fix to check submittedBy in controller until we're off chefs
  electrificationProjectValidator.getElectrificationProject,
  (req: Request<{ electrificationProjectId: string }>, res: Response, next: NextFunction): void => {
    electrificationProjectController.getElectrificationProject(req, res, next);
  }
);

/** Updates a electrification project*/
router.put(
  '/:electrificationProjectId',
  hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.UPDATE),
  hasAccess('electrificationProjectId'),
  electrificationProjectValidator.updateElectrificationProject,
  (
    req: Request<never, never, { project: ElectrificationProject; contacts: Array<Contact> }>,
    res: Response,
    next: NextFunction
  ): void => {
    electrificationProjectController.updateElectrificationProject(req, res, next);
  }
);

/** Updates is_deleted flag for a electrification project */
router.patch(
  '/:electrificationProjectId/delete',
  hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.DELETE),
  hasAccess('electrificationProjectId'),
  electrificationProjectValidator.updateIsDeletedFlag,
  (
    req: Request<{ electrificationProjectId: string }, never, { isDeleted: boolean }>,
    res: Response,
    next: NextFunction
  ): void => {
    electrificationProjectController.updateIsDeletedFlag(req, res, next);
  }
);

export default router;
