import express from 'express';

import { searchIdirUsersController } from '../../controllers/sso.ts';
import { hasAuthorization } from '../../middleware/authorization.ts';
import { hasIdentity } from '../../middleware/identity.ts';
import { requireSomeAuth } from '../../middleware/requireSomeAuth.ts';
import { requireSomeGroup } from '../../middleware/requireSomeGroup.ts';
import { Action, IdentityProviderKind, Resource } from '../../utils/enums/application.ts';

const router = express.Router();
router.use(requireSomeAuth);
router.use(hasIdentity(IdentityProviderKind.AZUREIDIR));
router.use(requireSomeGroup);

/** Search IDIR users in SSO */
router.get('/idir/users', hasAuthorization(Resource.SSO, Action.READ), searchIdirUsersController);

export default router;
