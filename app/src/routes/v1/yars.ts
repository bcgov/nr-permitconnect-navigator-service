import express from 'express';

import {
  deleteSubjectGroupController,
  getGroupsController,
  listPermissionsController,
  listSubjectPermissionsController
} from '../../controllers/yars.ts';
import { hasAuthorization } from '../../middleware/authorization.ts';
import { requireSomeAuth } from '../../middleware/requireSomeAuth.ts';
import { requireSomeGroup } from '../../middleware/requireSomeGroup.ts';
import { Action, Resource } from '../../utils/enums/application.ts';

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
