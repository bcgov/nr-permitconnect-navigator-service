import express from 'express';

import {
  deleteContactController,
  getContactController,
  getCurrentUserContactController,
  matchContactsController,
  searchContactsController,
  upsertContactController
} from '../../controllers/contact';
import { hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Resource } from '../../utils/enums/application';
import { contactValidator } from '../../validators';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

/** Get current user's contact information */
router.get('/', hasAuthorization(Resource.CONTACT, Action.READ), getCurrentUserContactController);

/** Match contacts */
router.post(
  '/match',
  hasAuthorization(Resource.CONTACT, Action.READ),
  contactValidator.matchContacts,
  matchContactsController
);

/** Search contacts */
router.get(
  '/search',
  hasAuthorization(Resource.CONTACT, Action.READ),
  contactValidator.searchContacts,
  searchContactsController
);

/** Get a specific contact */
router.get(
  '/:contactId',
  hasAuthorization(Resource.CONTACT, Action.READ),
  contactValidator.getContact,
  getContactController
);

/** Create or update a contact */
router.put(
  '/',
  hasAuthorization(Resource.CONTACT, Action.UPDATE),
  contactValidator.upsertContact,
  upsertContactController
);

/** Delete a specific contact */
router.delete(
  '/:contactId',
  hasAuthorization(Resource.CONTACT, Action.DELETE),
  contactValidator.deleteContact,
  deleteContactController
);

export default router;
