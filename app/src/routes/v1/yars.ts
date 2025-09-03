import express from 'express';

import { deleteSubjectGroupController, getGroupsController, getPermissionsController } from '../../controllers/yars';

import { hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Resource } from '../../utils/enums/application';

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
