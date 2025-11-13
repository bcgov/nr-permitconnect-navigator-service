import express from 'express';

import { getPeachRecordController } from '../../controllers/peach';
import { hasAuthorization } from '../../middleware/authorization';
// import { requireSomeAuth } from '../../middleware/requireSomeAuth';
// import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Resource } from '../../utils/enums/application';

const router = express.Router();
// TODO-RELEASE: Does this need auth? How should we do this for a CronJob?
// router.use(requireSomeAuth);
// router.use(requireSomeGroup);

/** Fetch PEACH Record from PEACH */
router.get('/record/:recordId/:systemId', hasAuthorization(Resource.PERMIT, Action.READ), getPeachRecordController);

export default router;
