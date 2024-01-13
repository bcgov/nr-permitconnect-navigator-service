import { documentService } from '../services';

import type { NextFunction, Request, Response } from '../interfaces/IExpress';

const controller = {
  async createDocument(
    req: Request<
      never,
      never,
      { documentId: string; submissionId: string; filename: string; mimeType: string; length: number }
    >,
    res: Response,
    next: NextFunction
  ) {
    try {
      const response = await documentService.createDocument(
        req.body.documentId,
        req.body.submissionId,
        req.body.filename,
        req.body.mimeType,
        req.body.length
      );
      res.status(200).send(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  async listDocuments(req: Request<{ submissionId: string }>, res: Response, next: NextFunction) {
    try {
      const response = await documentService.listDocuments(req.params.submissionId);
      res.status(200).send(response);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
