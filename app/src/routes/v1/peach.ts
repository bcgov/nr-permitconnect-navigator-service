import express from 'express';

import { getPeachSummaryController } from '#src/controllers/peach';
import { hasAuthorization } from '#src/middleware/authorization';
import { hasIdentity } from '#src/middleware/identity';
import { requireSomeAuth } from '#src/middleware/requireSomeAuth';
import { requireSomeGroup } from '#src/middleware/requireSomeGroup';
import { Action, IdentityProviderKind, Resource } from '#src/utils/enums/application';
import { peachValidator } from '#src/validators/index';

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
