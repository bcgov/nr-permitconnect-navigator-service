import express from 'express';

import {
  getElectrificationProjectPermitDataController,
  getGeneralProjectPermitDataController,
  getHousingProjectPermitDataController
} from '#src/controllers/reporting';
import { hasAuthorization } from '#src/middleware/authorization';
import { hasIdentity } from '#src/middleware/identity';
import { requireSomeAuth } from '#src/middleware/requireSomeAuth';
import { requireSomeGroup } from '#src/middleware/requireSomeGroup';
import { Action, IdentityProviderKind, Resource } from '#src/utils/enums/application';

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
