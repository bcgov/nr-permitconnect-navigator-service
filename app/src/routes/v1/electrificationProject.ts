import express from 'express';

import {
  createElectrificationProjectController,
  deleteElectrificationProjectController,
  deleteElectrificationProjectDraftController,
  emailElectrificationProjectConfirmationController,
  getElectrificationProjectActivityIdsController,
  getElectrificationProjectController,
  getElectrificationProjectsController,
  getElectrificationProjectDraftController,
  getElectrificationProjectDraftsController,
  getElectrificationProjectStatisticsController,
  searchElectrificationProjectsController,
  submitElectrificationProjectDraftController,
  updateElectrificationProjectController,
  upsertElectrificationProjectDraftController
} from '../../controllers/electrificationProject.ts';
import { hasAccess, hasAuthorization } from '../../middleware/authorization.ts';
import { requireSomeAuth } from '../../middleware/requireSomeAuth.ts';
import { requireSomeGroup } from '../../middleware/requireSomeGroup.ts';
import { filterActivityResponseByScope } from '../../middleware/responseFiltering.ts';
import { Action, Resource } from '../../utils/enums/application.ts';
import { electrificationProjectValidator } from '../../validators/index.ts';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

/** Gets a list of electrification projects */
router.get(
  '/',
  hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.READ),
  filterActivityResponseByScope,
  getElectrificationProjectsController
);

/** Get a list of all the activityIds */
router.get(
  '/activityIds',
  hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.READ),
  filterActivityResponseByScope,
  getElectrificationProjectActivityIdsController
);

/** Search electrification projects */
router.post(
  '/search',
  hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.READ),
  electrificationProjectValidator.searcElectrificationProjects,
  filterActivityResponseByScope,
  searchElectrificationProjectsController
);

/** Gets electrification project statistics*/
router.get('/statistics', electrificationProjectValidator.getStatistics, getElectrificationProjectStatisticsController);

/** Gets a electrification project draft */
router.get(
  '/draft/:draftId',
  hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.READ),
  hasAccess('draftId'),
  getElectrificationProjectDraftController
);

/** Gets a list of electrification project drafts */
router.get(
  '/draft',
  hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.READ),
  filterActivityResponseByScope,
  getElectrificationProjectDraftsController
);

/** Creates or updates an intake and set status to Draft */
router.put(
  '/draft',
  hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.CREATE),
  upsertElectrificationProjectDraftController
);

/** Creates or updates an intake and set status to Submitted */
router.put(
  '/draft/submit',
  hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.CREATE),
  electrificationProjectValidator.createElectrificationProject,
  submitElectrificationProjectDraftController
);

/** Send an email with the confirmation of electrification project */
router.put(
  '/email',
  hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.CREATE),
  electrificationProjectValidator.emailConfirmation,
  emailElectrificationProjectConfirmationController
);

/** Creates a blank electrification project */
router.post(
  '/',
  hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.CREATE),
  electrificationProjectValidator.createElectrificationProject,
  createElectrificationProjectController
);

/** Hard deletes a electrification project draft */
router.delete(
  '/draft/:draftId',
  hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.DELETE),
  hasAccess('draftId'),
  electrificationProjectValidator.deleteDraft,
  deleteElectrificationProjectDraftController
);

/** Gets a specific electrification project */
router.get(
  '/:electrificationProjectId',
  hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.READ),
  hasAccess('electrificationProjectId'),
  electrificationProjectValidator.getElectrificationProject,
  getElectrificationProjectController
);

/** Updates a electrification project*/
router.put(
  '/:electrificationProjectId',
  hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.UPDATE),
  hasAccess('electrificationProjectId'),
  electrificationProjectValidator.updateElectrificationProject,
  updateElectrificationProjectController
);

/** Deletes an electrification project */
router.delete(
  '/:electrificationProjectId',
  hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.DELETE),
  hasAccess('electrificationProjectId'),
  electrificationProjectValidator.deleteElectrificationProject,
  deleteElectrificationProjectController
);

export default router;
