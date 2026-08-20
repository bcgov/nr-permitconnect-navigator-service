import express from 'express';

import {
  deleteContactController,
  getContactController,
  getCurrentUserContactController,
  matchContactsController,
  searchContactsController,
  upsertContactController
} from '#src/controllers/contact';
import { hasAuthorization } from '#src/middleware/authorization';
import { hasIdentity } from '#src/middleware/identity';
import { requireSomeAuth } from '#src/middleware/requireSomeAuth';
import { requireSomeGroup } from '#src/middleware/requireSomeGroup';
import { Action, IdentityProviderKind, Resource } from '#src/utils/enums/application';
import { contactValidator } from '#src/validators/index';

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
router.post(
  '/search',
  hasIdentity(IdentityProviderKind.AZUREIDIR),
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
