import express from 'express';
import { permitController } from '../../controllers';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';

import type { NextFunction, Request, Response } from '../../interfaces/IExpress';

const router = express.Router();
router.use(requireSomeAuth);

// Permit create endpoint
router.put('/', (req: Request, res: Response, next: NextFunction): void => {
  permitController.createPermit(req, res, next);
});

// Permit update endpoint
router.put('/:permitId', (req: Request, res: Response, next: NextFunction): void => {
  permitController.updatePermit(req, res, next);
});

// Permit delete endpoint
router.delete('/:permitId', (req: Request, res: Response, next: NextFunction): void => {
  permitController.deletePermit(req, res, next);
});

// Permit list by activity endpoint
router.get('/list/:activityId', (req: Request, res: Response, next: NextFunction): void => {
  permitController.listPermits(req, res, next);
});

// Permit types endpoint
router.get('/types', (req: Request, res: Response, next: NextFunction): void => {
  permitController.getPermitTypes(req, res, next);
});

export default router;
