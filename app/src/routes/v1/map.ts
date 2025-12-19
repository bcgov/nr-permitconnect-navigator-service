import express from 'express';

import { getPIDsController } from '../../controllers/map.ts';
import { hasAuthorization } from '../../middleware/authorization.ts';
import { requireSomeAuth } from '../../middleware/requireSomeAuth.ts';
import { requireSomeGroup } from '../../middleware/requireSomeGroup.ts';
import { Action, Resource } from '../../utils/enums/application.ts';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

/** Get PIDs for a housing project */
router.get('/pids/:projectId', hasAuthorization(Resource.HOUSING_PROJECT, Action.READ), getPIDsController);

export default router;
