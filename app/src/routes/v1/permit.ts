import express from 'express';

import permitNote from './permitNote';
import {
  createPermitController,
  deletePermitController,
  getPermitController,
  listPermitsController,
  listPermitTypesController,
  updatePermitController
} from '../../controllers/permit';
import { hasAccess, hasAccessPermit, hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Resource } from '../../utils/enums/application';
import { permitValidator } from '../../validators';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);
router.use('/note', permitNote);

/** Permit list endpoint */
router.get('/', hasAuthorization(Resource.PERMIT, Action.READ), permitValidator.listPermits, listPermitsController);

/** Permit create endpoint */
router.put('/', hasAuthorization(Resource.PERMIT, Action.CREATE), permitValidator.upsertPermit, createPermitController);

/** Permit update endpoint */
router.put(
  '/:permitId',
  hasAuthorization(Resource.PERMIT, Action.UPDATE),
  hasAccess('permitId'),
  permitValidator.upsertPermit,
  updatePermitController
);

/** Permit delete endpoint */
router.delete(
  '/:permitId',
  hasAuthorization(Resource.PERMIT, Action.DELETE),
  hasAccess('permitId'),
  permitValidator.deletePermit,
  deletePermitController
);

/** Permit types endpoint */
router.get('/types', hasAuthorization(Resource.PERMIT, Action.READ), listPermitTypesController);

/** Permit get endpoint */
router.get(
  '/:permitId',
  hasAuthorization(Resource.PERMIT, Action.READ),
  hasAccessPermit('permitId'),
  permitValidator.getPermit,
  getPermitController
);

export default router;
