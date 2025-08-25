import express from 'express';

import {
  getElectrificationProjectPermitDataController,
  getHousingProjectPermitDataController
} from '../../controllers/reporting';
import { hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Resource } from '../../utils/enums/application';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

/** Get all electrification project and permit data for csv download */
router.get(
  '/electrificationProject/permit',
  hasAuthorization(Resource.REPORTING, Action.READ),
  getElectrificationProjectPermitDataController
);

/** Get all housing project and permit data for csv download */
router.get(
  '/housingProject/permit',
  hasAuthorization(Resource.REPORTING, Action.READ),
  getHousingProjectPermitDataController
);

export default router;
