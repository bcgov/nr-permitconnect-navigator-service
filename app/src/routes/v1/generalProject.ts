import express from 'express';

import {
  createGeneralProjectController,
  deleteGeneralProjectController,
  deleteGeneralProjectDraftController,
  emailGeneralProjectConfirmationController,
  getGeneralProjectActivityIdsController,
  getGeneralProjectController,
  getGeneralProjectsController,
  getGeneralProjectDraftController,
  getGeneralProjectDraftsController,
  getGeneralProjectStatisticsController,
  searchGeneralProjectsController,
  submitGeneralProjectDraftController,
  updateGeneralProjectController,
  upsertGeneralProjectDraftController
} from '../../controllers/generalProject.ts';
import { hasAccess, hasAuthorization } from '../../middleware/authorization.ts';
import { requireSomeAuth } from '../../middleware/requireSomeAuth.ts';
import { requireSomeGroup } from '../../middleware/requireSomeGroup.ts';
import { filterActivityResponseByScope } from '../../middleware/responseFiltering.ts';
import { Action, Resource } from '../../utils/enums/application.ts';
import { generalProjectValidator } from '../../validators/index.ts';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

/** Gets a list of general projects */
router.get(
  '/',
  hasAuthorization(Resource.GENERAL_PROJECT, Action.READ),
  filterActivityResponseByScope,
  getGeneralProjectsController
);

/** Get a list of all the activityIds */
router.get(
  '/activityIds',
  hasAuthorization(Resource.GENERAL_PROJECT, Action.READ),
  filterActivityResponseByScope,
  getGeneralProjectActivityIdsController
);

/** Search general projects */
router.post(
  '/search',
  hasAuthorization(Resource.GENERAL_PROJECT, Action.READ),
  generalProjectValidator.searchGeneralProjects,
  filterActivityResponseByScope,
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
router.get(
  '/draft',
  hasAuthorization(Resource.GENERAL_PROJECT, Action.READ),
  filterActivityResponseByScope,
  getGeneralProjectDraftsController
);

/** Creates or updates an intake and set status to Draft */
router.put('/draft', hasAuthorization(Resource.GENERAL_PROJECT, Action.CREATE), upsertGeneralProjectDraftController);

/** Creates or updates an intake and set status to Submitted */
router.put(
  '/draft/submit',
  hasAuthorization(Resource.GENERAL_PROJECT, Action.CREATE),
  generalProjectValidator.createGeneralProject,
  submitGeneralProjectDraftController
);

/** Send an email with the confirmation of general project */
router.put(
  '/email',
  hasAuthorization(Resource.GENERAL_PROJECT, Action.CREATE),
  generalProjectValidator.emailConfirmation,
  emailGeneralProjectConfirmationController
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

/** Updates a general project*/
router.put(
  '/:generalProjectId',
  hasAuthorization(Resource.GENERAL_PROJECT, Action.UPDATE),
  hasAccess('generalProjectId'),
  generalProjectValidator.updateGeneralProject,
  updateGeneralProjectController
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
