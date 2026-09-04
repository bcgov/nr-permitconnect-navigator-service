import express from 'express';

import { createAtsClientController, createAtsEnquiryController, searchAtsUsersController } from '#src/controllers/ats';
import { hasAuthorization } from '#src/middleware/authorization';
import { hasIdentity } from '#src/middleware/identity';
import { requireSomeAuth } from '#src/middleware/requireSomeAuth';
import { requireSomeGroup } from '#src/middleware/requireSomeGroup';
import { Action, IdentityProviderKind, Resource } from '#src/utils/enums/application';
import { atsValidator } from '#src/validators/index';

const router = express.Router();
router.use(requireSomeAuth);
router.use(hasIdentity(IdentityProviderKind.AZUREIDIR));
router.use(requireSomeGroup);

/** Search clients in ATS */
router.get(
  '/clients',
  hasAuthorization(Resource.ATS, Action.READ),
  atsValidator.searchATSUsers,
  searchAtsUsersController
);

/** Creates a client in ATS */
router.post(
  '/client',
  hasAuthorization(Resource.ATS, Action.CREATE),
  atsValidator.createATSClient,
  createAtsClientController
);

/** Creates an enquiry in ATS */
router.post(
  '/enquiry',
  hasAuthorization(Resource.ATS, Action.CREATE),
  atsValidator.createATSEnquiry,
  createAtsEnquiryController
);

export default router;
