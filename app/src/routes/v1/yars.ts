import express from 'express';

import { deleteSubjectGroupController, getGroupsController, getPermissionsController } from '../../controllers/yars.ts';
import { hasAuthorization } from '../../middleware/authorization.ts';
import { requireSomeAuth } from '../../middleware/requireSomeAuth.ts';
import { requireSomeGroup } from '../../middleware/requireSomeGroup.ts';
import { Action, Resource } from '../../utils/enums/application.ts';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

/** Get a list of groups */
router.get('/groups', hasAuthorization(Resource.YARS, Action.READ), getGroupsController);

/**
 * Publicly accessible
 * Get the current users permissions
 */
router.get('/permissions', getPermissionsController);

/** Delete a subjects group */
router.delete('/subject/group', hasAuthorization(Resource.YARS, Action.DELETE), deleteSubjectGroupController);

export default router;
