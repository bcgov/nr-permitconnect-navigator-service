import express from 'express';

import permitNote from './permitNote';
import { permitController } from '../../controllers';
import { hasAccess, hasAccessPermit, hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Initiative, Resource } from '../../utils/enums/application';
import { permitValidator } from '../../validators';

import type { NextFunction, Request, Response } from 'express';
import type { ListPermitsOptions, Permit } from '../../types';

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
  permitValidator.upsertPermit,
  (req: Request<never, never, Permit>, res: Response, next: NextFunction): void => {
    permitController.upsertPermit(req, res, next);
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
  (req: Request<never, never, never, { initiative: Initiative }>, res: Response, next: NextFunction): void => {
    permitController.getPermitTypes(req, res, next);
  }
);

// Permit get endpoint
router.get(
  '/:permitId',
  hasAuthorization(Resource.PERMIT, Action.READ),
  hasAccessPermit('permitId'),
  permitValidator.getPermit,
  (req: Request<{ permitId: string }>, res: Response, next: NextFunction): void => {
    permitController.getPermit(req, res, next);
  }
);

export default router;
