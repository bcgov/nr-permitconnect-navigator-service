import express from 'express';

import { getPeachRecordController } from '../../controllers/peach';
import { hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Resource } from '../../utils/enums/application';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

// TODO-RELEASE: Is permit resource and read sufficient for has auth on a peach route?
/** Fetch PEACH Record from PEACH */
// TODO-RELEASE: add validation
router.post('/record', hasAuthorization(Resource.PERMIT, Action.READ), getPeachRecordController);

export default router;
