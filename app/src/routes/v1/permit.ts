import express from 'express';
import { permitController } from '../../controllers';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { permitValidator } from '../../validators';

import type { NextFunction, Request, Response } from '../../interfaces/IExpress';

const router = express.Router();
router.use(requireSomeAuth);

// Permit create endpoint
router.put('/', permitValidator.createPermit, (req: Request, res: Response, next: NextFunction): void => {
  permitController.createPermit(req, res, next);
});

// Permit update endpoint
router.put('/:permitId', permitValidator.updatePermit, (req: Request, res: Response, next: NextFunction): void => {
  permitController.updatePermit(req, res, next);
});

// Permit delete endpoint
router.delete('/:permitId', permitValidator.deletePermit, (req: Request, res: Response, next: NextFunction): void => {
  permitController.deletePermit(req, res, next);
});

// Permit list by activity endpoint
router.get(
  '/list/:activityId',
  permitValidator.listPermits,
  (req: Request, res: Response, next: NextFunction): void => {
    permitController.listPermits(req, res, next);
  }
);

// Permit types endpoint
router.get('/types', (req: Request, res: Response, next: NextFunction): void => {
  permitController.getPermitTypes(req, res, next);
});

export default router;
