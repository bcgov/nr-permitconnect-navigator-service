import express from 'express';

import { getPeachSummaryController } from '../../controllers/peach.ts';
import { hasAuthorization } from '../../middleware/authorization.ts';
import { hasIdentity } from '../../middleware/identity.ts';
import { requireSomeAuth } from '../../middleware/requireSomeAuth.ts';
import { requireSomeGroup } from '../../middleware/requireSomeGroup.ts';
import { Action, IdentityProviderKind, Resource } from '../../utils/enums/application.ts';
import { peachValidator } from '../../validators/index.ts';

const router = express.Router();
router.use(requireSomeAuth);
router.use(hasIdentity(IdentityProviderKind.AZUREIDIR));
router.use(requireSomeGroup);

/** Fetch PEACH Record from PEACH */
router.post(
  '/record',
  hasAuthorization(Resource.PEACH, Action.READ),
  peachValidator.getPeachSummary,
  getPeachSummaryController
);

export default router;
