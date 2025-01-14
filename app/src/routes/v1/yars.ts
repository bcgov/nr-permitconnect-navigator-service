import express from 'express';

import { yarsController } from '../../controllers/index.ts';
import { requireSomeAuth } from '../../middleware/requireSomeAuth.ts';
import { requireSomeGroup } from '../../middleware/requireSomeGroup.ts';
import { GroupName } from '../../utils/enums/application.ts';

import type { NextFunction, Request, Response } from 'express';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

router.get('/groups', (req: Request, res: Response, next: NextFunction): void => {
  yarsController.getGroups(req, res, next);
});

router.get('/permissions', (req: Request, res: Response, next: NextFunction): void => {
  yarsController.getPermissions(req, res, next);
});

router.delete(
  '/subject/group',
  (req: Request<never, never, { sub: string; group: GroupName }>, res: Response, next: NextFunction): void => {
    yarsController.deleteSubjectGroup(req, res, next);
  }
);

export default router;
