import express from 'express';

import {
  createEnquiryController,
  getEnquiriesController,
  getEnquiryController,
  listRelatedEnquiriesController,
  searchEnquiriesController,
  updateEnquiryController,
  updateIsDeletedFlagController
} from '../../controllers/enquiry';
import { hasAccess, hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Resource } from '../../utils/enums/application';
import { enquiryValidator } from '../../validators';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

/** Gets a list of enquiries */
router.get('/', hasAuthorization(Resource.ENQUIRY, Action.READ), getEnquiriesController);

/** Search all enquiries */
router.get(
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

/** Gets enquiries related to an activityId */
router.get('/list/:activityId', listRelatedEnquiriesController);

/** Creates an enquiry and set status to Submitted */
router.put(
  '/',
  hasAuthorization(Resource.ENQUIRY, Action.CREATE),
  enquiryValidator.createEnquiry,
  createEnquiryController
);

/** Updates an enquiry */
router.put(
  '/:enquiryId',
  hasAuthorization(Resource.ENQUIRY, Action.UPDATE),
  hasAccess('enquiryId'),
  enquiryValidator.updateEnquiry,
  updateEnquiryController
);

/** Updates is_deleted flag for an enquiry */
router.patch(
  '/:enquiryId/delete',
  hasAuthorization(Resource.ENQUIRY, Action.DELETE),
  hasAccess('enquiryId'),
  enquiryValidator.updateIsDeletedFlag,
  updateIsDeletedFlagController
);

export default router;
