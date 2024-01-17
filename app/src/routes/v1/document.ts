import express from 'express';
import { documentController } from '../../controllers';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';

import type { NextFunction, Request, Response } from '../../interfaces/IExpress';

const router = express.Router();
router.use(requireSomeAuth);

router.put('/', (req: Request, res: Response, next: NextFunction): void => {
  documentController.createDocument(req, res, next);
});

router.delete('/:documentId', (req: Request, res: Response, next: NextFunction): void => {
  documentController.deleteDocument(req, res, next);
});

router.get('/list/:submissionId', (req: Request, res: Response, next: NextFunction): void => {
  documentController.listDocuments(req, res, next);
});

export default router;
