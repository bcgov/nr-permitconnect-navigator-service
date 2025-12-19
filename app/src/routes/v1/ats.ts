import express from 'express';

import {
  createATSClientController,
  createATSEnquiryController,
  searchATSUsersController
} from '../../controllers/ats.ts';
import { hasAuthorization } from '../../middleware/authorization.ts';
import { requireSomeAuth } from '../../middleware/requireSomeAuth.ts';
import { requireSomeGroup } from '../../middleware/requireSomeGroup.ts';
import { Action, Resource } from '../../utils/enums/application.ts';
import { atsValidator } from '../../validators/index.ts';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

/** Search clients in ATS */
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
