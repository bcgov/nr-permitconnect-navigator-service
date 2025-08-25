import express from 'express';

import { updateActivityContactController } from '../../controllers/activityContact';
import { hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Resource } from '../../utils/enums/application';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

router.post('/', hasAuthorization(Resource.CONTACT, Action.UPDATE), updateActivityContactController);

export default router;
