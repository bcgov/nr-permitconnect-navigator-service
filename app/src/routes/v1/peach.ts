import express from 'express';

import { getPeachRecordController } from '../../controllers/peach';
import { hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Resource } from '../../utils/enums/application';
import { peachValidator } from '../../validators';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

/** Fetch PEACH Record from PEACH */
router.post(
  '/record',
  hasAuthorization(Resource.PERMIT, Action.READ),
  peachValidator.permitTrackings,
  getPeachRecordController
);

export default router;
