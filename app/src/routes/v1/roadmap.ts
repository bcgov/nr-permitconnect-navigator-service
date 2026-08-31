import express from 'express';

import { getRoadmapNoteController, sendRoadmapController } from '#src/controllers/roadmap';
import { hasAuthorization } from '#src/middleware/authorization';
import { hasIdentity } from '#src/middleware/identity';
import { requireSomeAuth } from '#src/middleware/requireSomeAuth';
import { requireSomeGroup } from '#src/middleware/requireSomeGroup';
import { Action, IdentityProviderKind, Resource } from '#src/utils/enums/application';
import { roadmapValidator } from '#src/validators/index';

const router = express.Router();
router.use(requireSomeAuth);
router.use(hasIdentity(IdentityProviderKind.AZUREIDIR));
router.use(requireSomeGroup);

/** Send an email with the roadmap data */
router.post('/', hasAuthorization(Resource.ROADMAP, Action.CREATE), roadmapValidator.send, sendRoadmapController);

/** Get the roadmap note for a project */
router.get('/note', hasAuthorization(Resource.ROADMAP, Action.READ), getRoadmapNoteController);

export default router;
