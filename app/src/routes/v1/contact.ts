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

/** Get current user's contact information endpoint */
router.get(
  '/',
  hasAuthorization(Resource.CONTACT, Action.READ),
  (req: Request<never, never, never, never>, res: Response, next: NextFunction): void => {
    contactController.getCurrentUserContact(req, res, next);
  }
);

/** Match contacts endpoint */
router.post(
  '/match',
  hasAuthorization(Resource.CONTACT, Action.READ),
  contactValidator.matchContacts,
  (req: Request<never, never, ContactSearchParameters, never>, res: Response, next: NextFunction): void => {
    contactController.matchContacts(req, res, next);
  }
);

/** Search contacts endpoint */
router.get(
  '/search',
  hasAuthorization(Resource.CONTACT, Action.READ),
  contactValidator.searchContacts,
  (req: Request<never, never, never, ContactSearchParameters>, res: Response, next: NextFunction): void => {
    contactController.searchContacts(req, res, next);
  }
);

/** Gets a specific contact */
router.get(
  '/:contactId',
  hasAuthorization(Resource.CONTACT, Action.READ),
  contactValidator.getContact,
  (
    req: Request<{ contactId: string }, never, never, { includeActivities?: boolean }>,
    res: Response,
    next: NextFunction
  ): void => {
    contactController.getContact(req, res, next);
  }
);

//** Update a specific contact */
router.put(
  '/:contactId',
  hasAuthorization(Resource.CONTACT, Action.UPDATE),
  contactValidator.updateContact,
  (req: Request<never, never, Contact, never>, res: Response, next: NextFunction): void => {
    contactController.updateContact(req, res, next);
  }
);

/** Delete a specific contact */
router.delete(
  '/:contactId',
  hasAuthorization(Resource.CONTACT, Action.DELETE),
  contactValidator.deleteContact,
  (req: Request<{ contactId: string }>, res: Response, next: NextFunction): void => {
    contactController.deleteContact(req, res, next);
  }
);

export default router;
