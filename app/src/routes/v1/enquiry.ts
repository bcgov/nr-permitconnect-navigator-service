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

// Submission create draft endpoint
router.put(
  '/draft',
  decideValidation(enquiryValidator.createDraft),
  (req: Request, res: Response, next: NextFunction): void => {
    enquiryController.createDraft(req, res, next);
  }
);

// Submission update draft endpoint
router.put(
  '/draft/:activityId',
  decideValidation(enquiryValidator.updateDraft),
  (req: Request, res: Response, next: NextFunction): void => {
    enquiryController.updateDraft(req, res, next);
  }
);

export default router;
