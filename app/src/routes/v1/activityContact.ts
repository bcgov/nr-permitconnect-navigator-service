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

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

/** List activity_contact linkages for an activity */
router.get(
  '/:activityId/contact',
  requireActivityAdmin,
  activityContactValidator.listActivityContact,
  listActivityContactController
);

/** Create an activity_contact linkage for an activity */
router.post(
  '/:activityId/contact/:contactId',
  requireActivityAdmin,
  activityContactValidator.createActivityContact,
  createActivityContactController
);

/** Delete an activity_contact linkage for an activity */
router.delete(
  '/:activityId/contact/:contactId',
  requireActivityAdmin,
  activityContactValidator.deleteActivityContact,
  deleteActivityContactController
);

export default router;
