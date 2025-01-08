import express from 'express';

import { contactController } from '../../controllers';
import { hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Resource } from '../../utils/enums/application';
import { contactValidator } from '../../validators';

import type { NextFunction, Request, Response } from 'express';
import type { Contact, ContactSearchParameters } from '../../types';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

// Search users endpoint
router.get(
  '/',
  hasAuthorization(Resource.CONTACT, Action.READ),
  contactValidator.searchContacts,
  (req: Request<never, never, never, ContactSearchParameters>, res: Response, next: NextFunction): void => {
    contactController.searchContacts(req, res, next);
  }
);

router.put(
  '/:contactId',
  hasAuthorization(Resource.CONTACT, Action.UPDATE),
  contactValidator.updateContact,
  (req: Request<never, never, Contact, never>, res: Response, next: NextFunction): void => {
    contactController.updateContact(req, res, next);
  }
);

export default router;
