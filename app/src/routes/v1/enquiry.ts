import express from 'express';

import { enquiryController } from '../../controllers';
import { hasAccess, hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Resource } from '../../utils/enums/application';
import { enquiryValidator } from '../../validators';

import type { NextFunction, Request, Response } from 'express';
import type { Enquiry, EnquiryIntake } from '../../types';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

/** Gets a list of enquiries */
router.get(
  '/',
  hasAuthorization(Resource.ENQUIRY, Action.READ),
  (req: Request, res: Response, next: NextFunction): void => {
    enquiryController.getEnquiries(req, res, next);
  }
);

/** Gets a specific enquiry */
router.get(
  '/:enquiryId',
  hasAuthorization(Resource.ENQUIRY, Action.READ),
  hasAccess('enquiryId'),
  (req: Request<{ enquiryId: string }>, res: Response, next: NextFunction): void => {
    enquiryController.getEnquiry(req, res, next);
  }
);

/** Gets enquiries related to an activityId */
router.get('/list/:activityId', (req: Request<{ activityId: string }>, res: Response, next: NextFunction): void => {
  enquiryController.listRelatedEnquiries(req, res, next);
});

/** Deletes an enquiry */
router.delete(
  '/:enquiryId',
  hasAuthorization(Resource.ENQUIRY, Action.DELETE),
  hasAccess('enquiryId'),
  (req: Request<{ enquiryId: string }>, res: Response, next: NextFunction): void => {
    enquiryController.deleteEnquiry(req, res, next);
  }
);

/** Creates an enquiry and set status to Submitted */
router.put(
  '/',
  hasAuthorization(Resource.ENQUIRY, Action.CREATE),
  enquiryValidator.createEnquiry,
  (req: Request<never, never, EnquiryIntake>, res: Response, next: NextFunction): void => {
    enquiryController.createEnquiry(req, res, next);
  }
);

/** Updates an enquiry */
router.put(
  '/:enquiryId',
  hasAuthorization(Resource.ENQUIRY, Action.UPDATE),
  hasAccess('enquiryId'),
  enquiryValidator.updateEnquiry,
  (req: Request<never, never, Enquiry>, res: Response, next: NextFunction): void => {
    enquiryController.updateEnquiry(req, res, next);
  }
);

/** Updates is_deleted flag for an enquiry */
router.patch(
  '/:enquiryId/delete',
  hasAuthorization(Resource.ENQUIRY, Action.DELETE),
  hasAccess('enquiryId'),
  enquiryValidator.updateIsDeletedFlag,
  (req: Request<{ enquiryId: string }, never, { isDeleted: boolean }>, res: Response, next: NextFunction): void => {
    enquiryController.updateIsDeletedFlag(req, res, next);
  }
);

export default router;
