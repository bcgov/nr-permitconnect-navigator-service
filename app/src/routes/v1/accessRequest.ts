import express from 'express';

import {
  createUserAccessRequestController,
  getAccessRequestsController,
  processUserAccessRequestController
} from '#src/controllers/accessRequest';
import { hasAuthorization } from '#src/middleware/authorization';
import { hasIdentity } from '#src/middleware/identity';
import { requireSomeAuth } from '#src/middleware/requireSomeAuth';
import { requireSomeGroup } from '#src/middleware/requireSomeGroup';
import { Action, IdentityProviderKind, Resource } from '#src/utils/enums/application';
import { accessRequestValidator } from '#src/validators/index';

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
