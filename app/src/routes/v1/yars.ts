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
import { yarsValidator } from '#src/validators/index';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

/** Lists groups */
router.get('/groups', hasAuthorization(Resource.YARS, Action.READ), yarsValidator.getGroups, getGroupsController);

/** List permissions */
router.get(
  '/permissions',
  hasAuthorization(Resource.YARS, Action.READ),
  yarsValidator.listPermissions,
  listPermissionsController
);

/** Get the current subjects permissions */
router.get('/subject/permissions', listSubjectPermissionsController);

/** Delete a subjects group */
router.delete(
  '/subject/group',
  hasAuthorization(Resource.YARS, Action.DELETE),
  yarsValidator.deleteSubjectGroup,
  deleteSubjectGroupController
);

export default router;
