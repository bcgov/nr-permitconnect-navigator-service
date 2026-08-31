import express from 'express';

import {
  createEnquiryController,
  deleteEnquiryController,
  getEnquiryController,
  listEnquiriesController,
  listRelatedEnquiriesController,
  patchEnquiryController,
  searchEnquiriesController
} from '#src/controllers/enquiry';
import { hasAccess, hasAuthorization } from '#src/middleware/authorization';
import { requireSomeAuth } from '#src/middleware/requireSomeAuth';
import { requireSomeGroup } from '#src/middleware/requireSomeGroup';
import { Action, Resource } from '#src/utils/enums/application';
import { enquiryValidator } from '#src/validators/index';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

/** Gets enquiries related to an activityId */
router.get(
  '/list/:activityId',
  hasAuthorization(Resource.ENQUIRY, Action.READ),
  hasAccess('activityId'),
  listRelatedEnquiriesController
);

/** Search all enquiries */
router.post(
  '/search',
  hasAuthorization(Resource.ENQUIRY, Action.READ),
  enquiryValidator.searchEnquiries,
  searchEnquiriesController
);

/** Gets a specific enquiry */
router.get(
  '/:enquiryId',
  hasAuthorization(Resource.ENQUIRY, Action.READ),
  hasAccess('enquiryId'),
  getEnquiryController
);

/** Gets a list of enquiries */
router.get('/', hasAuthorization(Resource.ENQUIRY, Action.READ), listEnquiriesController);

/** Creates an enquiry and set status to Submitted */
router.post(
  '/',
  hasAuthorization(Resource.ENQUIRY, Action.CREATE),
  enquiryValidator.createEnquiry,
  createEnquiryController
);

/** Patches an enquiry */
router.patch(
  '/:enquiryId',
  hasAuthorization(Resource.ENQUIRY, Action.UPDATE),
  hasAccess('enquiryId'),
  enquiryValidator.patchEnquiry,
  patchEnquiryController
);

/** Deletes an enquiry */
router.delete(
  '/:enquiryId',
  hasAuthorization(Resource.ENQUIRY, Action.DELETE),
  hasAccess('enquiryId'),
  enquiryValidator.deleteEnquiry,
  deleteEnquiryController
);

export default router;
