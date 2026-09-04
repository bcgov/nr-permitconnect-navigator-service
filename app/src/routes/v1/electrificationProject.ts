import express from 'express';

import {
  createElectrificationProjectController,
  deleteElectrificationProjectController,
  deleteElectrificationProjectDraftController,
  getElectrificationProjectController,
  getElectrificationProjectDraftController,
  getElectrificationProjectDraftsController,
  getElectrificationProjectStatisticsController,
  listElectrificationProjectActivityIdsController,
  listElectrificationProjectsController,
  patchElectrificationProjectController,
  searchElectrificationProjectsController,
  submitElectrificationProjectDraftController,
  upsertElectrificationProjectDraftController
} from '#src/controllers/electrificationProject';
import { hasAccess, hasAuthorization } from '#src/middleware/authorization';
import { requireSomeAuth } from '#src/middleware/requireSomeAuth';
import { requireSomeGroup } from '#src/middleware/requireSomeGroup';
import { Action, Resource } from '#src/utils/enums/application';
import { electrificationProjectValidator } from '#src/validators/index';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

/** Gets a list of electrification projects */
router.get('/', hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.READ), listElectrificationProjectsController);

/** Get a list of all the activityIds */
router.get(
  '/activityIds',
  hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.READ),
  listElectrificationProjectActivityIdsController
);

/** Search electrification projects */
router.post(
  '/search',
  hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.READ),
  electrificationProjectValidator.searcElectrificationProjects,
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
  getElectrificationProjectDraftsController
);

/** Creates or updates an intake and set status to Draft */
router.post(
  '/draft',
  hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.CREATE),
  electrificationProjectValidator.upsertDraft,
  upsertElectrificationProjectDraftController
);

/** Creates or updates an intake and set status to Submitted */
router.post(
  '/draft/submit',
  hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.CREATE),
  electrificationProjectValidator.submitElectrificationProjectDraft,
  submitElectrificationProjectDraftController
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

/** Patches a electrification project*/
router.patch(
  '/:electrificationProjectId',
  hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.UPDATE),
  hasAccess('electrificationProjectId'),
  electrificationProjectValidator.patchElectrificationProject,
  patchElectrificationProjectController
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
