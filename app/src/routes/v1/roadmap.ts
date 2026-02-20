import express from 'express';

import { getRoadmapNoteController, sendRoadmapController } from '../../controllers/roadmap.ts';
import { hasAuthorization } from '../../middleware/authorization.ts';
import { requireSomeAuth } from '../../middleware/requireSomeAuth.ts';
import { requireSomeGroup } from '../../middleware/requireSomeGroup.ts';
import { Action, Resource } from '../../utils/enums/application.ts';
import { roadmapValidator } from '../../validators/index.ts';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

/** Send an email with the roadmap data */
router.put('/', hasAuthorization(Resource.ROADMAP, Action.CREATE), roadmapValidator.send, sendRoadmapController);

/** Get the roadmap note for a project */
router.get('/note', hasAuthorization(Resource.ROADMAP, Action.READ), getRoadmapNoteController);

export default router;
