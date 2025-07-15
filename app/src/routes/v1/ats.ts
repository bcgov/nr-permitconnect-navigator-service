import express from 'express';

import { createATSClientController, createATSEnquiryController, searchATSUsersController } from '../../controllers/ats';
import { hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Resource } from '../../utils/enums/application';
import { atsValidator } from '../../validators';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

router.get('/clients', hasAuthorization(Resource.ATS, Action.READ), searchATSUsersController);

/** Creates a client in ATS */
router.post(
  '/client',
  hasAuthorization(Resource.ATS, Action.CREATE),
  atsValidator.createATSClient,
  createATSClientController
);

/** Creates an enquiry in ATS */
router.post(
  '/enquiry',
  hasAuthorization(Resource.ATS, Action.CREATE),
  atsValidator.createATSEnquiry,
  createATSEnquiryController
);

export default router;
