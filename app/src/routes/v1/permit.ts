import express from 'express';

import {
  deletePermitController,
  getPermitController,
  intakePermitsController,
  listPermitsController,
  searchPermitsController,
  upsertPermitController
} from '#src/controllers/permit';
import { hasAccess, hasAuthorization } from '#src/middleware/authorization';
import { requireSomeAuth } from '#src/middleware/requireSomeAuth';
import { requireSomeGroup } from '#src/middleware/requireSomeGroup';
import { Action, Resource } from '#src/utils/enums/application';
import { permitValidator } from '#src/validators/index';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

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

/** Create multiple permit records */
router.post(
  '/intake',
  hasAuthorization(Resource.PERMIT, Action.CREATE),
  permitValidator.intakePermit,
  intakePermitsController
);

/** Get a list of permits based on search criteria */
router.get(
  '/search',
  hasAuthorization(Resource.PERMIT, Action.READ),
  permitValidator.searchPermits,
  searchPermitsController
);

/** Get a permit */
router.get(
  '/:permitId',
  hasAuthorization(Resource.PERMIT, Action.READ),
  hasAccess('permitId'),
  permitValidator.getPermit,
  getPermitController
);

export default router;
