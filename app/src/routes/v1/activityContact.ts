import express from 'express';

import {
  createActivityContactController,
  deleteActivityContactController,
  listActivityContactController
} from '../../controllers/activityContact';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { activityContactValidator } from '../../validators';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

// TODO: Need new middleware to determine if user has PRIMARY/ADMIN role on activity to modify these
// hasAuthorization doesn't work here

/** List activity_contact linkages for an activity */
router.get('/', activityContactValidator.listActivityContact, listActivityContactController);

/** Create an activity_contact linkage for an activity */
router.post('/:contactId', activityContactValidator.createActivityContact, createActivityContactController);

/** Delete an activity_contact linkage for an activity */
router.delete('/:contactId', activityContactValidator.deleteActivityContact, deleteActivityContactController);

export default router;
