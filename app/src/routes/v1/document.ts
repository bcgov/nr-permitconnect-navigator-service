import express from 'express';
import { documentController } from '../../controllers';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { documentValidator } from '../../validators';

import type { NextFunction, Request, Response } from '../../interfaces/IExpress';

const router = express.Router();
router.use(requireSomeAuth);

router.put('/', documentValidator.createDocument, (req: Request, res: Response, next: NextFunction): void => {
  documentController.createDocument(req, res, next);
});

router.delete(
  '/:documentId',
  documentValidator.deleteDocument,
  (req: Request, res: Response, next: NextFunction): void => {
    documentController.deleteDocument(req, res, next);
  }
);

router.get(
  '/list/:activityId',
  documentValidator.listDocuments,
  (req: Request, res: Response, next: NextFunction): void => {
    documentController.listDocuments(req, res, next);
  }
);

export default router;
