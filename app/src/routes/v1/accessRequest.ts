import express from 'express';

import {
  createUserAccessRequestController,
  getAccessRequestsController,
  processUserAccessRequestController
} from '../../controllers/accessRequest.ts';
import { hasAuthorization } from '../../middleware/authorization.ts';
import { hasIdentity } from '../../middleware/identity.ts';
import { requireSomeAuth } from '../../middleware/requireSomeAuth.ts';
import { requireSomeGroup } from '../../middleware/requireSomeGroup.ts';
import { Action, IdentityProviderKind, Resource } from '../../utils/enums/application.ts';
import { accessRequestValidator } from '../../validators/index.ts';

const router = express.Router();
router.use(requireSomeAuth);
router.use(hasIdentity(IdentityProviderKind.AZUREIDIR));
router.use(requireSomeGroup);

/** Request to create/revoke a user and access request - called by supervisor(201) & admin(200) when creating a user */
router.post(
  '/',
  hasAuthorization(Resource.ACCESS_REQUEST, Action.CREATE),
  accessRequestValidator.createUserAccessRequest,
  createUserAccessRequestController
);

/** Process an access request */
router.post(
  '/:accessRequestId',
  hasAuthorization(Resource.ACCESS_REQUEST, Action.UPDATE),
  accessRequestValidator.processUserAccessRequest,
  processUserAccessRequestController
);

/** Get access requests */
router.get('/', hasAuthorization(Resource.ACCESS_REQUEST, Action.READ), getAccessRequestsController);

export default router;
