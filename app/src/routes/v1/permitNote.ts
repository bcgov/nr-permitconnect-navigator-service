import express from 'express';

import { createPermitNoteController } from '../../controllers/permitNote';
import { hasAccess, hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Resource } from '../../utils/enums/application';
import { Problem } from '../../utils';
import { permitNoteValidator } from '../../validators';

import type { Request } from 'express';
import type { PermitNote } from '../../types';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

/** Create a permit note */
router.put(
  '/',
  hasAuthorization(Resource.PERMIT, Action.CREATE),
  permitNoteValidator.createPermitNote,
  createPermitNoteController
);

/** Update a permit note */
// TODO implement update
router.put(
  '/:permitId',
  hasAuthorization(Resource.PERMIT, Action.UPDATE),
  hasAccess('permitId'),
  // permitNoteValidator.updatePermitNote,
  (req: Request<never, never, PermitNote>): void => {
    throw new Problem(501, {
      detail: 'Not implemented.',
      instance: req.originalUrl
    });
  }
);

/** Delete a permit note */
// TODO implement soft delete
router.delete(
  '/:permitId',
  hasAuthorization(Resource.PERMIT, Action.DELETE),
  hasAccess('permitId'),
  // permitValidator.deletePermitNote,
  (req: Request<{ permitId: string }>): void => {
    throw new Problem(501, {
      detail: 'Not implemented.',
      instance: req.originalUrl
    });
  }
);

export default router;
