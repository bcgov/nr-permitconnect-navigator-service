import express from 'express';

import { getPIDsController } from '../../controllers/map';
import { hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Resource } from '../../utils/enums/application';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

router.get('/pids/:housingProjectId', hasAuthorization(Resource.HOUSING_PROJECT, Action.READ), getPIDsController);

export default router;
