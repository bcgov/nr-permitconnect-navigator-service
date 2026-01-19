import express from 'express';

import { getPeachSummaryController } from '../../controllers/peach.ts';
import { hasAuthorization } from '../../middleware/authorization.ts';
import { requireSomeAuth } from '../../middleware/requireSomeAuth.ts';
import { requireSomeGroup } from '../../middleware/requireSomeGroup.ts';
import { Action, Resource } from '../../utils/enums/application.ts';
import { peachValidator } from '../../validators/index.ts';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

/** Fetch PEACH Record from PEACH */
router.post(
  '/record',
  hasAuthorization(Resource.PERMIT, Action.READ),
  peachValidator.permitTrackings,
  getPeachSummaryController
);

export default router;
