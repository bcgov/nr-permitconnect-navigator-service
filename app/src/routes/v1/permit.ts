import express from 'express';

import permitNote from './permitNote.ts';
import {
  deletePermitController,
  getPermitController,
  getPermitTypesController,
  listPermitsController,
  upsertPermitController
} from '../../controllers/permit.ts';
import { hasAccess, hasAuthorization } from '../../middleware/authorization.ts';
import { requireSomeAuth } from '../../middleware/requireSomeAuth.ts';
import { requireSomeGroup } from '../../middleware/requireSomeGroup.ts';
import { Action, Resource } from '../../utils/enums/application.ts';
import { permitValidator } from '../../validators/index.ts';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);
router.use('/note', permitNote);

/** Get a list of permits */
router.get('/', hasAuthorization(Resource.PERMIT, Action.READ), permitValidator.listPermits, listPermitsController);

/** Create or update a permit */
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
