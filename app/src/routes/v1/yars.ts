import express from 'express';

import { yarsController } from '../../controllers';
import { hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Initiative, Resource } from '../../utils/enums/application';

import type { NextFunction, Request, Response } from 'express';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

router.get(
  '/groups',
  hasAuthorization(Resource.YARS, Action.READ),
  (req: Request<never, never, never, { initiative: Initiative }>, res: Response, next: NextFunction): void => {
    yarsController.getGroups(req, res, next);
  }
);

// Publicly accessible
router.get('/permissions', (req: Request, res: Response, next: NextFunction): void => {
  yarsController.getPermissions(req, res, next);
});

router.delete(
  '/subject/group',
  hasAuthorization(Resource.YARS, Action.DELETE),
  (req: Request<never, never, { sub: string; groupId: number }>, res: Response, next: NextFunction): void => {
    yarsController.deleteSubjectGroup(req, res, next);
  }
);

export default router;
