import express from 'express';

import {
  createHousingProjectController,
  deleteDraftController,
  emailHousingProjectConfirmationController,
  getHousingProjectActivityIdsController,
  getDraftController,
  getDraftsController,
  getHousingProjectController,
  getHousingProjectsController,
  getHousingProjectStatisticsController,
  searchHousingProjectsController,
  submitHousingProjectDraftController,
  updateHousingProjectDraftController,
  updateHousingProjectController,
  updateHousingProjectIsDeletedFlagController
} from '../../controllers/housingProject';
import { hasAccess, hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Resource } from '../../utils/enums/application';
import { housingProjectValidator } from '../../validators';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

/** Gets a list of housing projects */
router.get('/', hasAuthorization(Resource.HOUSING_PROJECT, Action.READ), getHousingProjectsController);

/** Get a list of all the activityIds */
router.get(
  '/activityIds',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.READ),
  getHousingProjectActivityIdsController
);

/** Search housing projects */
router.get(
  '/search',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.READ),
  housingProjectValidator.searcHousingProjects,
  searchHousingProjectsController
);

/** Gets housing project statistics*/
router.get(
  '/statistics',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.READ),
  housingProjectValidator.getStatistics,
  getHousingProjectStatisticsController
);

/** Gets a list of housing project drafts */
router.get(
  '/draft/:draftId',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.READ),
  hasAccess('draftId'),
  getDraftController
);

/** Gets a housing project draft */
router.get('/draft', hasAuthorization(Resource.HOUSING_PROJECT, Action.READ), getDraftsController);

/** Creates or updates an intake and set status to Draft */
router.put('/draft', hasAuthorization(Resource.HOUSING_PROJECT, Action.CREATE), updateHousingProjectDraftController);

/** Creates or updates an intake and set status to Submitted */
router.put(
  '/draft/submit',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.CREATE),
  housingProjectValidator.createHousingProject,
  submitHousingProjectDraftController
);

// Send an email with the confirmation of housing project
router.put(
  '/email',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.CREATE),
  housingProjectValidator.emailConfirmation,
  emailHousingProjectConfirmationController
);

/** Creates a blank housing project */
router.put(
  '/',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.CREATE),
  housingProjectValidator.createHousingProject,
  createHousingProjectController
);

/** Hard deletes a housing project draft */
router.delete(
  '/draft/:draftId',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.DELETE),
  hasAccess('draftId'),
  housingProjectValidator.deleteDraft,
  deleteDraftController
);

/** Gets a specific housing project */
router.get(
  '/:housingProjectId',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.READ),
  //hasAccess('housingProjectId'), // TODO: Temp fix to check submittedBy in controller until we're off chefs
  housingProjectValidator.getHousingProject,
  getHousingProjectController
);

/** Updates a housing project*/
router.put(
  '/:housingProjectId',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.UPDATE),
  hasAccess('housingProjectId'),
  housingProjectValidator.updateHousingProject,
  updateHousingProjectController
);

/** Updates is_deleted flag for a housing project */
router.patch(
  '/:housingProjectId/delete',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.DELETE),
  hasAccess('housingProjectId'),
  housingProjectValidator.updateIsDeletedFlag,

  updateHousingProjectIsDeletedFlagController
);

export default router;
