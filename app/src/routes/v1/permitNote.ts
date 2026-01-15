import express from 'express';

import { createPermitNoteController } from '../../controllers/permitNote.ts';
import { hasAccess, hasAuthorization } from '../../middleware/authorization.ts';
import { requireSomeAuth } from '../../middleware/requireSomeAuth.ts';
import { requireSomeGroup } from '../../middleware/requireSomeGroup.ts';
import { Action, Resource } from '../../utils/enums/application.ts';
import { Problem } from '../../utils/index.ts';
import { permitNoteValidator } from '../../validators/index.ts';

import type { Request } from 'express';
import type { PermitNote } from '../../types/index.ts';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

/** Create a permit note */
router.post(
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
