import express from 'express';

import permitNote from './permitNote.ts';
import { permitController } from '../../controllers/index.ts';
import { hasAccess, hasAuthorization } from '../../middleware/authorization.ts';
import { requireSomeAuth } from '../../middleware/requireSomeAuth.ts';
import { requireSomeGroup } from '../../middleware/requireSomeGroup.ts';
import { Action, Resource } from '../../utils/enums/application.ts';
import { permitValidator } from '../../validators/index.ts';

import type { NextFunction, Request, Response } from 'express';
import type { ListPermitsOptions, Permit } from '../../types/index.ts';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);
router.use('/note', permitNote);

// Permit list endpoint
router.get(
  '/',
  hasAuthorization(Resource.PERMIT, Action.READ),
  permitValidator.listPermits,
  (req: Request<never, never, never, Partial<ListPermitsOptions>>, res: Response, next: NextFunction): void => {
    permitController.listPermits(req, res, next);
  }
);

// Permit create endpoint
router.put(
  '/',
  hasAuthorization(Resource.PERMIT, Action.CREATE),
  permitValidator.createPermit,
  (req: Request<never, never, Permit>, res: Response, next: NextFunction): void => {
    permitController.createPermit(req, res, next);
  }
);

// Permit update endpoint
router.put(
  '/:permitId',
  hasAuthorization(Resource.PERMIT, Action.UPDATE),
  hasAccess('permitId'),
  permitValidator.updatePermit,
  (req: Request<never, never, Permit>, res: Response, next: NextFunction): void => {
    permitController.updatePermit(req, res, next);
  }
);

// Permit delete endpoint
router.delete(
  '/:permitId',
  hasAuthorization(Resource.PERMIT, Action.DELETE),
  hasAccess('permitId'),
  permitValidator.deletePermit,
  (req: Request<{ permitId: string }>, res: Response, next: NextFunction): void => {
    permitController.deletePermit(req, res, next);
  }
);

// Permit types endpoint
router.get(
  '/types',
  hasAuthorization(Resource.PERMIT, Action.READ),
  (req: Request, res: Response, next: NextFunction): void => {
    permitController.getPermitTypes(req, res, next);
  }
);

// Permit get endpoint
router.get(
  '/:permitId',
  hasAuthorization(Resource.PERMIT, Action.READ),
  hasAccess('permitId'),
  permitValidator.getPermit,
  (req: Request<{ permitId: string }>, res: Response, next: NextFunction): void => {
    permitController.getPermit(req, res, next);
  }
);

export default router;
