// @ts-expect-error api-problem lacks a defined interface; code still works fine
import Problem from 'api-problem';
import express from 'express';

import { permitNoteController } from '../../controllers';
import { hasAccess, hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Resource } from '../../utils/enums/application';
import { permitNoteValidator } from '../../validators';

import type { NextFunction, Request, Response } from 'express';
import type { PermitNote } from '../../types';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

// Permit note create endpoint
router.put(
  '/',
  hasAuthorization(Resource.PERMIT, Action.CREATE),
  permitNoteValidator.createPermitNote,
  (req: Request<never, never, PermitNote>, res: Response, next: NextFunction): void => {
    permitNoteController.createPermitNote(req, res, next);
  }
);

// Permit note update endpoint
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

// Permit note delete endpoint
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
