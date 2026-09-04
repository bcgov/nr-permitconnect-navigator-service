import express from 'express';

import {
  createHousingProjectController,
  deleteHousingProjectController,
  deleteHousingProjectDraftController,
  getHousingProjectController,
  getHousingProjectDraftController,
  getHousingProjectDraftsController,
  getHousingProjectStatisticsController,
  listHousingProjectActivityIdsController,
  listHousingProjectsController,
  patchHousingProjectController,
  searchHousingProjectsController,
  submitHousingProjectDraftController,
  upsertHousingProjectDraftController
} from '#src/controllers/housingProject';
import { hasAccess, hasAuthorization } from '#src/middleware/authorization';
import { hasIdentity } from '#src/middleware/identity';
import { requireSomeAuth } from '#src/middleware/requireSomeAuth';
import { requireSomeGroup } from '#src/middleware/requireSomeGroup';
import { Action, IdentityProviderKind, Resource } from '#src/utils/enums/application';
import { housingProjectValidator } from '#src/validators/index';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

/** Gets a list of housing projects */
router.get('/', hasAuthorization(Resource.HOUSING_PROJECT, Action.READ), listHousingProjectsController);

/** Get a list of all the activityIds */
router.get(
  '/activityIds',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.READ),
  listHousingProjectActivityIdsController
);

/** Search housing projects */
router.post(
  '/search',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.READ),
  housingProjectValidator.searchHousingProjects,
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
router.get('/draft', hasAuthorization(Resource.HOUSING_PROJECT, Action.READ), getHousingProjectDraftsController);

/** Creates or updates an intake and set status to Draft */
router.post(
  '/draft',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.CREATE),
  housingProjectValidator.upsertDraft,
  upsertHousingProjectDraftController
);

/** Creates or updates an intake and set status to Submitted */
router.post(
  '/draft/submit',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.CREATE),
  housingProjectValidator.submitHousingProjectDraft,
  submitHousingProjectDraftController
);

/** Creates a blank housing project */
router.post(
  '/',
  hasIdentity(IdentityProviderKind.AZUREIDIR),
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

/** Patches a housing project*/
router.patch(
  '/:housingProjectId',
  hasAuthorization(Resource.HOUSING_PROJECT, Action.UPDATE),
  hasAccess('housingProjectId'),
  housingProjectValidator.patchHousingProject,
  patchHousingProjectController
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
