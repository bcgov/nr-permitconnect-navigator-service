import express from 'express';

import { documentController } from '../../controllers';
import { hasAccess, hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Resource } from '../../utils/enums/application';
import { documentValidator } from '../../validators';

import type { NextFunction, Request, Response } from 'express';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

router.put(
  '/',
  hasAuthorization(Resource.DOCUMENT, Action.CREATE),
  documentValidator.createDocument,
  (
    req: Request<
      never,
      never,
      { documentId: string; activityId: string; filename: string; mimeType: string; length: number }
    >,
    res: Response,
    next: NextFunction
  ): void => {
    documentController.createDocument(req, res, next);
  }
);

router.delete(
  '/:documentId',
  hasAuthorization(Resource.DOCUMENT, Action.DELETE),
  hasAccess('documentId'),
  documentValidator.deleteDocument,
  (req: Request<{ documentId: string }>, res: Response, next: NextFunction): void => {
    documentController.deleteDocument(req, res, next);
  }
);

router.get(
  '/list/:activityId',
  hasAuthorization(Resource.DOCUMENT, Action.READ),
  documentValidator.listDocuments,
  (req: Request<{ activityId: string }>, res: Response, next: NextFunction): void => {
    documentController.listDocuments(req, res, next);
  }
);

export default router;
