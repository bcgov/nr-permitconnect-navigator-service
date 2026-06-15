import express from 'express';

import {
  getElectrificationProjectPermitDataController,
  getGeneralProjectPermitDataController,
  getHousingProjectPermitDataController
} from '../../controllers/reporting.ts';
import { hasAuthorization } from '../../middleware/authorization.ts';
import { hasIdentity } from '../../middleware/identity.ts';
import { requireSomeAuth } from '../../middleware/requireSomeAuth.ts';
import { requireSomeGroup } from '../../middleware/requireSomeGroup.ts';
import { Action, IdentityProviderKind, Resource } from '../../utils/enums/application.ts';

const router = express.Router();
router.use(requireSomeAuth);
router.use(hasIdentity(IdentityProviderKind.AZUREIDIR));
router.use(requireSomeGroup);

/** Get all electrification project and permit data for csv download */
router.get(
  '/electrification-project/permit',
  hasAuthorization(Resource.REPORTING, Action.READ),
  getElectrificationProjectPermitDataController
);

/** Get all general project and permit data for csv download */
router.get(
  '/general-project/permit',
  hasAuthorization(Resource.REPORTING, Action.READ),
  getGeneralProjectPermitDataController
);

/** Get all housing project and permit data for csv download */
router.get(
  '/housing-project/permit',
  hasAuthorization(Resource.REPORTING, Action.READ),
  getHousingProjectPermitDataController
);

export default router;
