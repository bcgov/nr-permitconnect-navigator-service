import express from 'express';

import {
  createActivityContactController,
  deleteActivityContactController,
  listActivityContactController
} from '../../controllers/activityContact';
import { requireActivityAdmin } from '../../middleware/requireActivityAdmin';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';

import { activityContactValidator } from '../../validators';
import { hasAccess, hasAuthorization } from '../../middleware/authorization';
import { Action, Resource } from '../../utils/enums/application';

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

/** Delete an activity_contact linkage for an activity */
router.delete(
  '/:contactId',
  hasAuthorization(Resource.ACTIVITY_CONTACT, Action.DELETE),
  requireActivityAdmin,
  activityContactValidator.deleteActivityContact,
  deleteActivityContactController
);

export default router;
