import { documentService, userService } from '../services';
import { NIL } from 'uuid';

import { getCurrentIdentity } from '../components/utils';

import type { NextFunction, Request, Response } from '../interfaces/IExpress';

const controller = {
  async createDocument(
    req: Request<
      never,
      never,
      { documentId: string; activityId: string; filename: string; mimeType: string; length: number }
    >,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = await userService.getCurrentUserId(getCurrentIdentity(req.currentUser, NIL), NIL);
      const response = await documentService.createDocument(
        req.body.documentId,
        req.body.activityId,
        req.body.filename,
        req.body.mimeType,
        req.body.length,
        userId as string
      );
      res.status(201).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  async deleteDocument(req: Request<{ documentId: string }>, res: Response, next: NextFunction) {
    try {
      const response = await documentService.deleteDocument(req.params.documentId);
      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  async listDocuments(req: Request<{ activityId: string }>, res: Response, next: NextFunction) {
    try {
      const response = await documentService.listDocuments(req.params.activityId);
      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
