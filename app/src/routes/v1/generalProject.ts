import express from 'express';

import {
  createGeneralProjectController,
  deleteGeneralProjectController,
  deleteGeneralProjectDraftController,
  getGeneralProjectController,
  getGeneralProjectDraftController,
  getGeneralProjectDraftsController,
  getGeneralProjectStatisticsController,
  listGeneralProjectActivityIdsController,
  listGeneralProjectsController,
  patchGeneralProjectController,
  searchGeneralProjectsController,
  submitGeneralProjectDraftController,
  upsertGeneralProjectDraftController
} from '#src/controllers/generalProject';
import { hasAccess, hasAuthorization } from '#src/middleware/authorization';
import { requireSomeAuth } from '#src/middleware/requireSomeAuth';
import { requireSomeGroup } from '#src/middleware/requireSomeGroup';
import { Action, Resource } from '#src/utils/enums/application';
import { generalProjectValidator } from '#src/validators/index';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

/** Gets a list of general projects */
router.get('/', hasAuthorization(Resource.GENERAL_PROJECT, Action.READ), listGeneralProjectsController);

/** Get a list of all the activityIds */
router.get(
  '/activityIds',
  hasAuthorization(Resource.GENERAL_PROJECT, Action.READ),
  listGeneralProjectActivityIdsController
);

/** Search general projects */
router.post(
  '/search',
  hasAuthorization(Resource.GENERAL_PROJECT, Action.READ),
  generalProjectValidator.searchGeneralProjects,
  searchGeneralProjectsController
);

/** Gets general project statistics*/
router.get(
  '/statistics',
  hasAuthorization(Resource.GENERAL_PROJECT, Action.READ),
  generalProjectValidator.getStatistics,
  getGeneralProjectStatisticsController
);

/** Get a specific general project draft */
router.get(
  '/draft/:draftId',
  hasAuthorization(Resource.GENERAL_PROJECT, Action.READ),
  hasAccess('draftId'),
  getGeneralProjectDraftController
);

/** Gets a list of general project drafts */
router.get('/draft', hasAuthorization(Resource.GENERAL_PROJECT, Action.READ), getGeneralProjectDraftsController);

/** Creates or updates an intake and set status to Draft */
router.post(
  '/draft',
  hasAuthorization(Resource.GENERAL_PROJECT, Action.CREATE),
  generalProjectValidator.upsertDraft,
  upsertGeneralProjectDraftController
);

/** Creates or updates an intake and set status to Submitted */
router.post(
  '/draft/submit',
  hasAuthorization(Resource.GENERAL_PROJECT, Action.CREATE),
  generalProjectValidator.submitGeneralProjectDraft,
  submitGeneralProjectDraftController
);

/** Creates a blank general project */
router.post(
  '/',
  hasAuthorization(Resource.GENERAL_PROJECT, Action.CREATE),
  generalProjectValidator.createGeneralProject,
  createGeneralProjectController
);

/** Hard deletes a general project draft */
router.delete(
  '/draft/:draftId',
  hasAuthorization(Resource.GENERAL_PROJECT, Action.DELETE),
  hasAccess('draftId'),
  generalProjectValidator.deleteDraft,
  deleteGeneralProjectDraftController
);

/** Gets a specific general project */
router.get(
  '/:generalProjectId',
  hasAuthorization(Resource.GENERAL_PROJECT, Action.READ),
  hasAccess('generalProjectId'),
  generalProjectValidator.getGeneralProject,
  getGeneralProjectController
);

/** Patches a general project*/
router.patch(
  '/:generalProjectId',
  hasAuthorization(Resource.GENERAL_PROJECT, Action.UPDATE),
  hasAccess('generalProjectId'),
  generalProjectValidator.patchGeneralProject,
  patchGeneralProjectController
);

/** Deletes a general project */
router.delete(
  '/:generalProjectId',
  hasAuthorization(Resource.GENERAL_PROJECT, Action.DELETE),
  hasAccess('generalProjectId'),
  generalProjectValidator.deleteGeneralProject,
  deleteGeneralProjectController
);

export default router;
