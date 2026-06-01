import express from 'express';

import { searchUsersController } from '../../controllers/user.ts';
import { hasAuthorization } from '../../middleware/authorization.ts';
import { hasIdentity } from '../../middleware/identity.ts';
import { requireSomeAuth } from '../../middleware/requireSomeAuth.ts';
import { requireSomeGroup } from '../../middleware/requireSomeGroup.ts';
import { Action, IdentityProviderKind, Resource } from '../../utils/enums/application.ts';
import { userValidator } from '../../validators/index.ts';

const router = express.Router();
router.use(requireSomeAuth);
router.use(hasIdentity(IdentityProviderKind.AZUREIDIR));
router.use(requireSomeGroup);

/** Search users endpoint */
router.get('/', hasAuthorization(Resource.USER, Action.READ), userValidator.searchUsers, searchUsersController);

export default router;
