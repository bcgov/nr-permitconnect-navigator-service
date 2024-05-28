import express from 'express';
import { enquiryController } from '../../controllers';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
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
router.get('/', (req: Request, res: Response, next: NextFunction): void => {
  enquiryController.getEnquiries(req, res, next);
});

/** Gets a specific enquiry */
router.get('/:enquiryId', (req: Request, res: Response, next: NextFunction): void => {
  enquiryController.getEnquiry(req, res, next);
});

/** Deletes an enquiry */
router.delete('/:enquiryId', (req: Request, res: Response, next: NextFunction): void => {
  enquiryController.deleteEnquiry(req, res, next);
});

/** Creates an enquiry with Draft status */
router.put(
  '/draft',
  decideValidation(enquiryValidator.createDraft),
  (req: Request, res: Response, next: NextFunction): void => {
    enquiryController.createDraft(req, res, next);
  }
);

/** Updates an enquiry with Draft status */
router.put(
  '/draft/:enquiryId',
  decideValidation(enquiryValidator.updateDraft),
  (req: Request, res: Response, next: NextFunction): void => {
    enquiryController.updateDraft(req, res, next);
  }
);

export default router;
