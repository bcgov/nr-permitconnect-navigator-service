import express from 'express';

import { searchUsersController } from '#src/controllers/user';
import { hasAuthorization } from '#src/middleware/authorization';
import { hasIdentity } from '#src/middleware/identity';
import { requireSomeAuth } from '#src/middleware/requireSomeAuth';
import { requireSomeGroup } from '#src/middleware/requireSomeGroup';
import { Action, IdentityProviderKind, Resource } from '#src/utils/enums/application';
import { userValidator } from '#src/validators/index';

const router = express.Router();
router.use(requireSomeAuth);
router.use(hasIdentity(IdentityProviderKind.AZUREIDIR));
router.use(requireSomeGroup);

/** Search users endpoint */
router.post('/', hasAuthorization(Resource.USER, Action.READ), userValidator.searchUsers, searchUsersController);

export default router;
