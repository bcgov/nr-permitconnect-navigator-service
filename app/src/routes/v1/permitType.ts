import express from 'express';

import { listPermitTypesController } from '../../controllers/permitType.ts';
import { hasAuthorization } from '../../middleware/authorization.ts';
import { requireSomeAuth } from '../../middleware/requireSomeAuth.ts';
import { requireSomeGroup } from '../../middleware/requireSomeGroup.ts';
import { Action, Resource } from '../../utils/enums/application.ts';
import { permitTypeValidator } from '../../validators/index.ts';

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
