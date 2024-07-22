import express from 'express';

import { documentController } from '../../controllers';
import { hasPermission } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { Action, Resource } from '../../utils/enums/application';
import { documentValidator } from '../../validators';

import type { NextFunction, Request, Response } from '../../interfaces/IExpress';

const router = express.Router();
router.use(requireSomeAuth);

router.put(
  '/',
  hasPermission(Resource.DOCUMENT, Action.CREATE),
  documentValidator.createDocument,
  (req: Request, res: Response, next: NextFunction): void => {
    documentController.createDocument(req, res, next);
  }
);

router.delete(
  '/:documentId',
  hasPermission(Resource.DOCUMENT, Action.DELETE),
  documentValidator.deleteDocument,
  (req: Request, res: Response, next: NextFunction): void => {
    documentController.deleteDocument(req, res, next);
  }
);

router.get(
  '/list/:activityId',
  hasPermission(Resource.DOCUMENT, Action.READ),
  documentValidator.listDocuments,
  (req: Request, res: Response, next: NextFunction): void => {
    documentController.listDocuments(req, res, next);
  }
);

export default router;
