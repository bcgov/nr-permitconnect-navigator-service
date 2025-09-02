import express from 'express';

import {
  createUserAccessRequestController,
  getAccessRequestsController,
  processUserAccessRequestController
} from '../../controllers/accessRequest';
import { hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Resource } from '../../utils/enums/application';
import { accessRequestValidator } from '../../validators';

const router = express.Router();
router.use(requireSomeAuth);
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
