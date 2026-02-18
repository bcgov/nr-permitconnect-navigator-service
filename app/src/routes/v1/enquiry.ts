import express from 'express';

import {
  createEnquiryController,
  deleteEnquiryController,
  getEnquiriesController,
  getEnquiryController,
  listRelatedEnquiriesController,
  searchEnquiriesController,
  updateEnquiryController
} from '../../controllers/enquiry.ts';
import { hasAccess, hasAuthorization } from '../../middleware/authorization.ts';
import { requireSomeAuth } from '../../middleware/requireSomeAuth.ts';
import { requireSomeGroup } from '../../middleware/requireSomeGroup.ts';
import { filterActivityResponseByScope } from '../../middleware/responseFiltering.ts';
import { Action, Resource } from '../../utils/enums/application.ts';
import { enquiryValidator } from '../../validators/index.ts';

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
router.post(
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
