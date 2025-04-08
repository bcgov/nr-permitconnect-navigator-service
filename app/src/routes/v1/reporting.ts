import express from 'express';

import { reportingController } from '../../controllers';
import { hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Resource } from '../../utils/enums/application';

import type { NextFunction, Request, Response } from 'express';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

/** Get all electrification project and permit data for csv download */
router.get(
  '/electrificationProject/permit',
  hasAuthorization(Resource.REPORTING, Action.READ),
  (req: Request, res: Response, next: NextFunction): void => {
    reportingController.getElectrificationProjectPermitData(req, res, next);
  }
);

/** Get all housing project and permit data for csv download */
router.get(
  '/housingProject/permit',
  hasAuthorization(Resource.REPORTING, Action.READ),
  (req: Request, res: Response, next: NextFunction): void => {
    reportingController.getHousingProjectPermitData(req, res, next);
  }
);

export default router;
