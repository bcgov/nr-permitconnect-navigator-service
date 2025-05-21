import express from 'express';

import { atsController } from '../../controllers';
import { hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Resource } from '../../utils/enums/application';
import { atsValidator } from '../../validators';

import type { NextFunction, Request, Response } from 'express';
import type { ATSClientResource, ATSEnquiryResource, ATSUserSearchParameters } from '../../types';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

router.get(
  '/clients',
  hasAuthorization(Resource.ATS, Action.READ),
  (req: Request<never, never, never, ATSUserSearchParameters>, res: Response, next: NextFunction): void => {
    atsController.searchATSUsers(req, res, next);
  }
);

/** Creates a client in ATS */
router.post(
  '/client',
  hasAuthorization(Resource.ATS, Action.CREATE),
  atsValidator.createATSClient,
  (req: Request<never, never, ATSClientResource, never>, res: Response, next: NextFunction): void => {
    atsController.createATSClient(req, res, next);
  }
);

/** Creates an enquiry in ATS */
router.post(
  '/enquiry',
  hasAuthorization(Resource.ATS, Action.CREATE),
  atsValidator.createATSEnquiry,
  (req: Request<never, never, ATSEnquiryResource, never>, res: Response, next: NextFunction): void => {
    atsController.createATSEnquiry(req, res, next);
  }
);

export default router;
