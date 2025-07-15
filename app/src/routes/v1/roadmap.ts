import express from 'express';

import { sendRoadmapController } from '../../controllers/roadmap';
import { hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Resource } from '../../utils/enums/application';
import { roadmapValidator } from '../../validators';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

// Send an email with the roadmap data
router.put('/', hasAuthorization(Resource.ROADMAP, Action.CREATE), roadmapValidator.send, sendRoadmapController);

export default router;
