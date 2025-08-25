import express from 'express';

import { deleteSubjectGroupController, getGroupsController, getPermissionsController } from '../../controllers/yars';

import { hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Resource } from '../../utils/enums/application';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

router.get('/groups', hasAuthorization(Resource.YARS, Action.READ), getGroupsController);

// Publicly accessible
router.get('/permissions', getPermissionsController);

router.delete('/subject/group', hasAuthorization(Resource.YARS, Action.DELETE), deleteSubjectGroupController);

export default router;
