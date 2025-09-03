import express from 'express';

import {
  searchBasicBceidUsersController,
  searchBusinessBceidUsersController,
  searchIdirUsersController
} from '../../controllers/sso';
import { hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Resource } from '../../utils/enums/application';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

/** Search IDIR users in SSO */
router.get('/idir/users', hasAuthorization(Resource.SSO, Action.READ), searchIdirUsersController);

/** Search basic BCeID users in SSO */
router.get('/basic-bceid/users', hasAuthorization(Resource.SSO, Action.READ), searchBasicBceidUsersController);

/** Search business BCeID users in SSO */
router.get('/business-bceid/users', hasAuthorization(Resource.SSO, Action.READ), searchBusinessBceidUsersController);

export default router;
