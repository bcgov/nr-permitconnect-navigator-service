import express from 'express';
import { ssoController } from '../../controllers';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';

import type { NextFunction, Request, Response } from '../../interfaces/IExpress';

const router = express.Router();
router.use(requireSomeAuth);

router.post('/requestBasicAccess', (req: Request, res: Response, next: NextFunction): void => {
  ssoController.requestBasicAccess(req, res, next);
});

router.get('/idir/users', (req: Request, res: Response, next: NextFunction): void => {
  ssoController.searchIdirUsers(req, res, next);
});

router.get('/basic-bceid/users', (req: Request, res: Response, next: NextFunction): void => {
  ssoController.searchBasicBceidUsers(req, res, next);
});

router.get('/roles', (req: Request, res: Response, next: NextFunction): void => {
  ssoController.getRoles(req, res, next);
});

export default router;
