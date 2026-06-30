import express from 'express';

import {
  createAtsClientController,
  createAtsEnquiryController,
  searchAtsUsersController
} from '../../controllers/ats.ts';
import { hasAuthorization } from '../../middleware/authorization.ts';
import { hasIdentity } from '../../middleware/identity.ts';
import { requireSomeAuth } from '../../middleware/requireSomeAuth.ts';
import { requireSomeGroup } from '../../middleware/requireSomeGroup.ts';
import { Action, IdentityProviderKind, Resource } from '../../utils/enums/application.ts';
import { atsValidator } from '../../validators/index.ts';

const router = express.Router();
router.use(requireSomeAuth);
router.use(hasIdentity(IdentityProviderKind.AZUREIDIR));
router.use(requireSomeGroup);

/** Search clients in ATS */
router.get('/clients', hasAuthorization(Resource.ATS, Action.READ), searchAtsUsersController);

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
