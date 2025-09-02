import express from 'express';

import { searchUsersController } from '../../controllers/user';
import { hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Resource } from '../../utils/enums/application';
import { userValidator } from '../../validators';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

/** Search users endpoint */
router.get('/', hasAuthorization(Resource.USER, Action.READ), userValidator.searchUsers, searchUsersController);

export default router;
