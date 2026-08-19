import express from 'express';

import {
  createActivityContactController,
  deleteActivityContactController,
  listActivityContactController,
  updateActivityContactController
} from '#src/controllers/activityContact';
import { hasAccess, hasAuthorization } from '#src/middleware/authorization';
import { requireActivityAdmin } from '#src/middleware/requireActivityAdmin';
import { requireSomeAuth } from '#src/middleware/requireSomeAuth';
import { requireSomeGroup } from '#src/middleware/requireSomeGroup';
import { Action, Resource } from '#src/utils/enums/application';
import { activityContactValidator } from '#src/validators/index';

const router = express.Router({ mergeParams: true }); // mergeParams allows parent router to pass route params down
router.use(requireSomeAuth);
router.use(requireSomeGroup);

/** List activity_contact linkages for an activity */
router.get(
  '/',
  hasAuthorization(Resource.ACTIVITY_CONTACT, Action.READ),
  hasAccess('activityId'),
  activityContactValidator.listActivityContact,
  listActivityContactController
);

/** Create an activity_contact linkage for an activity */
router.post(
  '/:contactId',
  hasAuthorization(Resource.ACTIVITY_CONTACT, Action.CREATE),
  requireActivityAdmin,
  activityContactValidator.createActivityContact,
  createActivityContactController
);

/** Update an activity_contact linkage for an activity */
router.put(
  '/:contactId',
  hasAuthorization(Resource.ACTIVITY_CONTACT, Action.UPDATE),
  requireActivityAdmin,
  activityContactValidator.updateActivityContact,
  updateActivityContactController
);

/** Delete an activity_contact linkage for an activity */
router.delete(
  '/:contactId',
  hasAuthorization(Resource.ACTIVITY_CONTACT, Action.DELETE),
  requireActivityAdmin,
  activityContactValidator.deleteActivityContact,
  deleteActivityContactController
);

export default router;
