import express from 'express';

import {
  deleteSubjectGroupController,
  getGroupsController,
  listPermissionsController,
  listSubjectPermissionsController
} from '#src/controllers/yars';
import { hasAuthorization } from '#src/middleware/authorization';
import { requireSomeAuth } from '#src/middleware/requireSomeAuth';
import { requireSomeGroup } from '#src/middleware/requireSomeGroup';
import { Action, Resource } from '#src/utils/enums/application';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

/** Lists groups */
router.get('/groups', hasAuthorization(Resource.YARS, Action.READ), getGroupsController);

/** List permissions */
router.get('/permissions', hasAuthorization(Resource.YARS, Action.READ), listPermissionsController);

/** Get the current subjects permissions */
router.get('/subject/permissions', listSubjectPermissionsController);

/** Delete a subjects group */
router.delete('/subject/group', hasAuthorization(Resource.YARS, Action.DELETE), deleteSubjectGroupController);

export default router;
