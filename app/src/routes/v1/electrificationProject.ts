import express from 'express';

import {
  createElectrificationProjectController,
  deleteDraftController,
  emailConfirmationController,
  getActivityIdsController,
  getDraftController,
  getDraftsController,
  getElectrificationProjectController,
  getElectrificationProjectsController,
  getStatisticsController,
  searchElectrificationProjectsController,
  submitDraftController,
  updateDraftController,
  updateElectrificationProjectController,
  updateIsDeletedFlagController
} from '../../controllers/electrificationProject';
import { hasAccess, hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Resource } from '../../utils/enums/application';
import { electrificationProjectValidator } from '../../validators';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

/** Gets a list of electrification projects */
router.get('/', hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.READ), getElectrificationProjectsController);

/** Get a list of all the activityIds */
router.get('/activityIds', hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.READ), getActivityIdsController);

/** Search electrification projects */
router.get(
  '/search',
  hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.READ),
  electrificationProjectValidator.searcElectrificationProjects,
  searchElectrificationProjectsController
);

/** Gets electrification project statistics*/
router.get('/statistics', electrificationProjectValidator.getStatistics, getStatisticsController);

/** Gets a electrification project draft */
router.get(
  '/draft/:draftId',
  hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.READ),
  hasAccess('draftId'),
  getDraftController
);

/** Gets a list of electrification project drafts */
router.get('/draft', hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.READ), getDraftsController);

/** Creates or updates an intake and set status to Draft */
router.put('/draft', hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.CREATE), updateDraftController);

/** Creates or updates an intake and set status to Submitted */
router.put(
  '/draft/submit',
  hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.CREATE),
  electrificationProjectValidator.createElectrificationProject,
  submitDraftController
);

// Send an email with the confirmation of electrification project
router.put(
  '/email',
  hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.CREATE),
  electrificationProjectValidator.emailConfirmation,
  emailConfirmationController
);

/** Creates a blank electrification project */
router.put(
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
  deleteDraftController
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

/** Updates is_deleted flag for a electrification project */
router.patch(
  '/:electrificationProjectId/delete',
  hasAuthorization(Resource.ELECTRIFICATION_PROJECT, Action.DELETE),
  hasAccess('electrificationProjectId'),
  electrificationProjectValidator.updateIsDeletedFlag,
  updateIsDeletedFlagController
);

export default router;
