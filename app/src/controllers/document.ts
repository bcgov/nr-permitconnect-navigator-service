import { addDashesToUuid, mixedQueryToArray, isTruthy } from '../components/utils';
import { documentService } from '../services';

import type { NextFunction, Request, Response } from 'express';

const controller = {
  async searchDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await documentService.getDocuments(req.query.submissionId as string);
      res.status(200).send(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  async linkDocument(req: Request, res: Response, next: NextFunction) {
    try {
      await documentService.createDocumentEntry(
        req.params.submissionId,
        req.params.comsId,
        req.header('filename') as string,
        req.header('Content-Type') as string,
        parseInt(req.header('Content-Length'))
      );
    } catch (e: unknown) {
      // if fail, return error (client will rollback/hard-delete uploaded COMS file)
      next(e);
    }
  }
};

export default controller;
