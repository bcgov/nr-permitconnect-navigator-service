import express from 'express';

import permitNote from './permitNote';
import {
  deletePermitController,
  getPermitController,
  getPermitTypesController,
  listPermitsController,
  upsertPermitController
} from '../../controllers/permit';
import { hasAccess, hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Resource } from '../../utils/enums/application';
import { permitValidator } from '../../validators';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);
router.use('/note', permitNote);

/** Get a list of permits */
router.get('/', hasAuthorization(Resource.PERMIT, Action.READ), permitValidator.listPermits, listPermitsController);

/** Create a permit */
router.put('/', hasAuthorization(Resource.PERMIT, Action.CREATE), permitValidator.upsertPermit, upsertPermitController);

/** Delete a permit */
router.delete(
  '/:permitId',
  hasAuthorization(Resource.PERMIT, Action.DELETE),
  hasAccess('permitId'),
  permitValidator.deletePermit,
  deletePermitController
);

/** Get a list of permit types */
router.get('/types', hasAuthorization(Resource.PERMIT, Action.READ), getPermitTypesController);

/** Get a permit */
router.get(
  '/:permitId',
  hasAuthorization(Resource.PERMIT, Action.READ),
  hasAccess('permitId'),
  permitValidator.getPermit,
  getPermitController
);

export default router;
