import express from 'express';

import { permitController } from '../../controllers';
import { hasPermission } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { Action, Resource } from '../../utils/enums/application';
import { permitValidator } from '../../validators';

import type { NextFunction, Request, Response } from '../../interfaces/IExpress';

const router = express.Router();
router.use(requireSomeAuth);

// Permit create endpoint
router.put(
  '/',
  hasPermission(Resource.PERMIT, Action.CREATE),
  permitValidator.createPermit,
  (req: Request, res: Response, next: NextFunction): void => {
    permitController.createPermit(req, res, next);
  }
);

// Permit update endpoint
router.put(
  '/:permitId',
  hasPermission(Resource.PERMIT, Action.UPDATE),
  permitValidator.updatePermit,
  (req: Request, res: Response, next: NextFunction): void => {
    permitController.updatePermit(req, res, next);
  }
);

// Permit delete endpoint
router.delete(
  '/:permitId',
  hasPermission(Resource.PERMIT, Action.DELETE),
  permitValidator.deletePermit,
  (req: Request, res: Response, next: NextFunction): void => {
    permitController.deletePermit(req, res, next);
  }
);

// Permit list by activity endpoint
router.get(
  '/list/:activityId',
  hasPermission(Resource.PERMIT, Action.READ),
  permitValidator.listPermits,
  (req: Request, res: Response, next: NextFunction): void => {
    permitController.listPermits(req, res, next);
  }
);

// Permit types endpoint
router.get(
  '/types',
  hasPermission(Resource.PERMIT, Action.READ),
  (req: Request, res: Response, next: NextFunction): void => {
    permitController.getPermitTypes(req, res, next);
  }
);

export default router;
