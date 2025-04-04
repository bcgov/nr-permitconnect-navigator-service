import express from 'express';

import { housingProjectController } from '../../controllers';
import { hasAccess, hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Resource } from '../../utils/enums/application';
import { housingProjectValidator } from '../../validators';

import type { NextFunction, Request, Response } from 'express';
import type {
  Draft,
  Email,
  StatisticsFilters,
  HousingProject,
  HousingProjectIntake,
  HousingProjectSearchParameters,
  Contact
} from '../../types';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

/** Gets a list of housing projects */
router.get(
  '/',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.READ),
  (req: Request, res: Response, next: NextFunction): void => {
    housingProjectController.getHousingProjects(req, res, next);
  }
);

/** Get a list of all the activityIds */
router.get(
  '/activityIds',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.READ),
  (req: Request, res: Response, next: NextFunction): void => {
    housingProjectController.getActivityIds(req, res, next);
  }
);

/** Search housing projects */
router.get(
  '/search',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.READ),
  housingProjectValidator.searcHousingProjects,
  (req: Request<never, never, never, HousingProjectSearchParameters>, res: Response, next: NextFunction): void => {
    housingProjectController.searchHousingProjects(req, res, next);
  }
);

/** Gets housing project statistics*/
router.get(
  '/statistics',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.READ),
  housingProjectValidator.getStatistics,
  (req: Request<never, never, never, StatisticsFilters>, res: Response, next: NextFunction): void => {
    housingProjectController.getStatistics(req, res, next);
  }
);

/** Gets a list of housing project drafts */
router.get(
  '/draft/:draftId',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.READ),
  hasAccess('draftId'),
  (req: Request<{ draftId: string }>, res: Response, next: NextFunction): void => {
    housingProjectController.getDraft(req, res, next);
  }
);

/** Gets a housing project draft */
router.get(
  '/draft',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.READ),
  (req: Request, res: Response, next: NextFunction): void => {
    housingProjectController.getDrafts(req, res, next);
  }
);

/** Creates or updates an intake and set status to Draft */
router.put(
  '/draft',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.CREATE),
  (req: Request<never, never, Draft>, res: Response, next: NextFunction): void => {
    housingProjectController.updateDraft(req, res, next);
  }
);

/** Creates or updates an intake and set status to Submitted */
router.put(
  '/draft/submit',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.CREATE),
  housingProjectValidator.createHousingProject,
  (req: Request<never, never, HousingProjectIntake>, res: Response, next: NextFunction): void => {
    housingProjectController.submitDraft(req, res, next);
  }
);

// Send an email with the confirmation of housing project
router.put(
  '/email',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.CREATE),
  housingProjectValidator.emailConfirmation,
  (req: Request<never, never, Email>, res: Response, next: NextFunction): void => {
    housingProjectController.emailConfirmation(req, res, next);
  }
);

/** Creates a blank housing project */
router.put(
  '/',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.CREATE),
  housingProjectValidator.createHousingProject,
  (req: Request<never, never, HousingProjectIntake>, res: Response, next: NextFunction): void => {
    housingProjectController.createHousingProject(req, res, next);
  }
);

/** Hard deletes a housing project */
router.delete(
  '/:housingProjectId',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.DELETE),
  hasAccess('housingProjectId'),
  housingProjectValidator.deleteHousingProject,
  (req: Request<{ housingProjectId: string }>, res: Response, next: NextFunction): void => {
    housingProjectController.deleteHousingProject(req, res, next);
  }
);

/** Hard deletes a housing project draft */
router.delete(
  '/draft/:draftId',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.DELETE),
  hasAccess('draftId'),
  housingProjectValidator.deleteDraft,
  (req: Request<{ draftId: string }>, res: Response, next: NextFunction): void => {
    housingProjectController.deleteDraft(req, res, next);
  }
);

/** Gets a specific housing project */
router.get(
  '/:housingProjectId',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.READ),
  //hasAccess('housingProjectId'), // TODO: Temp fix to check submittedBy in controller until we're off chefs
  housingProjectValidator.getHousingProject,
  (req: Request<{ housingProjectId: string }>, res: Response, next: NextFunction): void => {
    housingProjectController.getHousingProject(req, res, next);
  }
);

/** Updates a housing project*/
router.put(
  '/:housingProjectId',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.UPDATE),
  hasAccess('housingProjectId'),
  housingProjectValidator.updateHousingProject,
  (
    req: Request<never, never, HousingProject & { contacts: Array<Contact> }>,
    res: Response,
    next: NextFunction
  ): void => {
    housingProjectController.updateHousingProject(req, res, next);
  }
);

/** Updates is_deleted flag for a housing project */
router.patch(
  '/:housingProjectId/delete',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.DELETE),
  hasAccess('housingProjectId'),
  housingProjectValidator.updateIsDeletedFlag,
  (
    req: Request<{ housingProjectId: string }, never, { isDeleted: boolean }>,
    res: Response,
    next: NextFunction
  ): void => {
    housingProjectController.updateIsDeletedFlag(req, res, next);
  }
);

export default router;
