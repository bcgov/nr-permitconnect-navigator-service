import { noteService } from '../services';

import type { NextFunction, Request, Response } from '../interfaces/IExpress';
import { CurrentUser } from '../types';

const controller = {
  createNote: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await noteService.createNote(req.body, req.currentUser as CurrentUser);
      res.status(200).send(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  async listNotes(req: Request<{ submissionId: string }>, res: Response, next: NextFunction) {
    try {
      const response = await noteService.listNotes(req.params.submissionId);
      res.status(200).send(response);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
