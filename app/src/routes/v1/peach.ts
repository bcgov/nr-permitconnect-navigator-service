import express from 'express';

import { syncPeachRecords } from '../../controllers/peach';
// import { hasAuthorization } from '../../middleware/authorization';
// import { requireSomeAuth } from '../../middleware/requireSomeAuth';
// import { requireSomeGroup } from '../../middleware/requireSomeGroup';
// import { Action, Resource } from '../../utils/enums/application';

const router = express.Router();
// TODO-PR: Does this need auth? How should we do this for a CronJob?
// router.use(requireSomeAuth);
// router.use(requireSomeGroup);

/** Sync PEACH Records to PCNS DB */
router.post(
  '/record',
  // hasAuthorization(Resource.REPORTING, Action.READ),
  syncPeachRecords
);

export default router;
