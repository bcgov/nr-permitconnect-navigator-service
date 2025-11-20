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
import { hasAuthorization } from '../../middleware/authorization';
import { Action, Resource } from '../../utils/enums/application';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

/** List activity_contact linkages for an activity */
router.get(
  '/:activityId/contact',
  hasAuthorization(Resource.ACTIVITY_CONTACT, Action.READ),
  requireActivityAdmin,
  activityContactValidator.listActivityContact,
  listActivityContactController
);

/** Create an activity_contact linkage for an activity */
router.post(
  '/:activityId/contact/:contactId',
  hasAuthorization(Resource.ACTIVITY_CONTACT, Action.CREATE),
  requireActivityAdmin,
  activityContactValidator.createActivityContact,
  createActivityContactController
);

/** Delete an activity_contact linkage for an activity */
router.delete(
  '/:activityId/contact/:contactId',
  hasAuthorization(Resource.ACTIVITY_CONTACT, Action.DELETE),
  requireActivityAdmin,
  activityContactValidator.deleteActivityContact,
  deleteActivityContactController
);

export default router;
