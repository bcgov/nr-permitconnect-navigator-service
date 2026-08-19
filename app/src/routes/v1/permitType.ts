import express from 'express';

import { listPermitTypesController } from '#src/controllers/permitType';
import { hasAuthorization } from '#src/middleware/authorization';
import { requireSomeAuth } from '#src/middleware/requireSomeAuth';
import { requireSomeGroup } from '#src/middleware/requireSomeGroup';
import { Action, Resource } from '#src/utils/enums/application';
import { permitTypeValidator } from '#src/validators/index';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

/** Get a list of permit types */
router.get(
  '/',
  hasAuthorization(Resource.PERMIT_TYPE, Action.READ),
  permitTypeValidator.listPermitTypes,
  listPermitTypesController
);

export default router;
