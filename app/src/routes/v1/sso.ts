import express from 'express';

import { searchIdirUsersController } from '#src/controllers/sso';
import { hasAuthorization } from '#src/middleware/authorization';
import { hasIdentity } from '#src/middleware/identity';
import { requireSomeAuth } from '#src/middleware/requireSomeAuth';
import { requireSomeGroup } from '#src/middleware/requireSomeGroup';
import { validate } from '#src/middleware/validation';
import { Action, IdentityProviderKind, Resource } from '#src/utils/enums/application';
import { schema } from '#src/schemas/request/sso';

const router = express.Router();
router.use(requireSomeAuth);
router.use(hasIdentity(IdentityProviderKind.AZUREIDIR));
router.use(requireSomeGroup);

/** Search IDIR users in SSO */
router.get(
  '/idir/users',
  hasAuthorization(Resource.SSO, Action.READ),
  validate(schema.searchIdirUsers),
  searchIdirUsersController
);

export default router;
