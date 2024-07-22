import express from 'express';

import { enquiryController } from '../../controllers';
import { hasPermission } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { Action, Resource } from '../../utils/enums/application';
import { enquiryValidator } from '../../validators';

import type { NextFunction, Request, Response } from '../../interfaces/IExpress';
import type { Middleware } from '../../types';

const router = express.Router();
router.use(requireSomeAuth);

const decideValidation = (validator: Middleware) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: any = req.body;

    if (body.submit) {
      return validator(req, _res, next);
    } else {
      return next();
    }
  };
};

/** Gets a list of enquiries */
router.get(
  '/',
  hasPermission(Resource.ENQUIRY, Action.READ),
  (req: Request, res: Response, next: NextFunction): void => {
    enquiryController.getEnquiries(req, res, next);
  }
);

/** Gets a specific enquiry */
router.get(
  '/:enquiryId',
  hasPermission(Resource.ENQUIRY, Action.READ),
  (req: Request, res: Response, next: NextFunction): void => {
    enquiryController.getEnquiry(req, res, next);
  }
);

/** Gets enquiries related to an activityId */
router.get('/list/:activityId', (req: Request, res: Response, next: NextFunction): void => {
  enquiryController.listRelatedEnquiries(req, res, next);
});

/** Deletes an enquiry */
router.delete(
  '/:enquiryId',
  hasPermission(Resource.ENQUIRY, Action.DELETE),
  (req: Request, res: Response, next: NextFunction): void => {
    enquiryController.deleteEnquiry(req, res, next);
  }
);

/** Creates an enquiry with Draft status */
router.put(
  '/draft',
  hasPermission(Resource.ENQUIRY, Action.CREATE),
  decideValidation(enquiryValidator.createDraft),
  (req: Request, res: Response, next: NextFunction): void => {
    enquiryController.createDraft(req, res, next);
  }
);

/** Updates an enquiry with Draft status */
router.put(
  '/draft/:enquiryId',
  hasPermission(Resource.ENQUIRY, Action.UPDATE),
  decideValidation(enquiryValidator.updateDraft),
  (req: Request, res: Response, next: NextFunction): void => {
    enquiryController.updateDraft(req, res, next);
  }
);

/** Updates an enquiry */
router.put(
  '/:enquiryId',
  hasPermission(Resource.ENQUIRY, Action.UPDATE),
  enquiryValidator.updateEnquiry,
  (req: Request, res: Response, next: NextFunction): void => {
    enquiryController.updateEnquiry(req, res, next);
  }
);

/** Updates is_deleted flag for an enquiry */
router.patch(
  '/:enquiryId/delete',
  hasPermission(Resource.ENQUIRY, Action.DELETE),
  enquiryValidator.updateIsDeletedFlag,
  (req: Request, res: Response, next: NextFunction): void => {
    enquiryController.updateIsDeletedFlag(req, res, next);
  }
);

export default router;
