import express from 'express';
import { documentController } from '../../controllers';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';

import type { NextFunction, Request, Response } from 'express';

const router = express.Router();
router.use(requireSomeAuth);

// proposed endpoints

// GET /documents/list/:submissionId
//  (get list of docs for given submission)
/* response:
   <array of document table responses>
*/
router.get('/documents/list/:submissionId', (req: Request, res: Response, next: NextFunction): void => {
  documentController.searchDocuments(req, res, next);
});

// PUT documents?submissionId=:submissionId&comsId=:comsId
//  headers: filesize, mimetype, filename - if missing any, reject (future: use joi for validation, but not for now)
router.put('/documents', (req: Request, res: Response, next: NextFunction): void => {
  documentController.linkDocument(req, res, next);
});
