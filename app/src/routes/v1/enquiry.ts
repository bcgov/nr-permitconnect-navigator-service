import express from 'express';

import {
  createEnquiryController,
  deleteEnquiryController,
  getEnquiriesController,
  getEnquiryController,
  listRelatedEnquiriesController,
  searchEnquiriesController,
  updateEnquiryController
} from '../../controllers/enquiry';
import { hasAccess, hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { filterActivityResponseByScope } from '../../middleware/responseFiltering';
import { Action, Resource } from '../../utils/enums/application';
import { enquiryValidator } from '../../validators';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

/** Gets enquiries related to an activityId */
router.get(
  '/list/:activityId',
  hasAuthorization(Resource.ENQUIRY, Action.READ),
  hasAccess('activityId'),
  filterActivityResponseByScope,
  listRelatedEnquiriesController
);

/** Search all enquiries */
router.get(
  '/search',
  hasAuthorization(Resource.ENQUIRY, Action.READ),
  enquiryValidator.searchEnquiries,
  filterActivityResponseByScope,
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
router.get('/', hasAuthorization(Resource.ENQUIRY, Action.READ), filterActivityResponseByScope, getEnquiriesController);

/** Creates an enquiry and set status to Submitted */
router.post(
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

/** Deletes an enquiry */
router.delete(
  '/:enquiryId',
  hasAuthorization(Resource.ENQUIRY, Action.DELETE),
  hasAccess('enquiryId'),
  enquiryValidator.deleteEnquiry,
  deleteEnquiryController
);

export default router;
