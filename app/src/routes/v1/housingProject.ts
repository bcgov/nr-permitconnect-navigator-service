import express from 'express';

import {
  createHousingProjectController,
  deleteHousingProjectController,
  deleteHousingProjectDraftController,
  emailHousingProjectConfirmationController,
  getHousingProjectActivityIdsController,
  getHousingProjectController,
  getHousingProjectsController,
  getHousingProjectDraftController,
  getHousingProjectDraftsController,
  getHousingProjectStatisticsController,
  searchHousingProjectsController,
  submitHousingProjectDraftController,
  updateHousingProjectController,
  upsertHousingProjectDraftController
} from '../../controllers/housingProject';
import { hasAccess, hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { filterActivityResponseByScope } from '../../middleware/responseFiltering';
import { Action, Resource } from '../../utils/enums/application';
import { housingProjectValidator } from '../../validators';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

/** Gets a list of housing projects */
router.get(
  '/',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.READ),
  filterActivityResponseByScope,
  getHousingProjectsController
);

/** Get a list of all the activityIds */
router.get(
  '/activityIds',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.READ),
  filterActivityResponseByScope,
  getHousingProjectActivityIdsController
);

/** Search housing projects */
router.get(
  '/search',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.READ),
  housingProjectValidator.searcHousingProjects,
  filterActivityResponseByScope,
  searchHousingProjectsController
);

/** Gets housing project statistics*/
router.get(
  '/statistics',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.READ),
  housingProjectValidator.getStatistics,
  getHousingProjectStatisticsController
);

/** Get a specific housing project draft */
router.get(
  '/draft/:draftId',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.READ),
  hasAccess('draftId'),
  getHousingProjectDraftController
);

/** Gets a list of housing project drafts */
router.get(
  '/draft',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.READ),
  filterActivityResponseByScope,
  getHousingProjectDraftsController
);

/** Creates or updates an intake and set status to Draft */
router.put('/draft', hasAuthorization(Resource.HOUSING_PROJECT, Action.CREATE), upsertHousingProjectDraftController);

/** Creates or updates an intake and set status to Submitted */
router.put(
  '/draft/submit',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.CREATE),
  housingProjectValidator.createHousingProject,
  submitHousingProjectDraftController
);

/** Send an email with the confirmation of housing project */
router.put(
  '/email',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.CREATE),
  housingProjectValidator.emailConfirmation,
  emailHousingProjectConfirmationController
);

/** Creates a blank housing project */
router.post(
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
  deleteHousingProjectDraftController
);

/** Gets a specific housing project */
router.get(
  '/:housingProjectId',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.READ),
  hasAccess('housingProjectId'),
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

/** Deletes a housing project */
router.delete(
  '/:housingProjectId',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.DELETE),
  hasAccess('housingProjectId'),
  housingProjectValidator.deleteHousingProject,
  deleteHousingProjectController
);

export default router;
