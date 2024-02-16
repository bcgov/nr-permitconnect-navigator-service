import { NIL } from 'uuid';

import { noteService, userService } from '../services';
import { getCurrentIdentity } from '../components/utils';

import type { NextFunction, Request, Response } from '../interfaces/IExpress';

const controller = {
  createNote: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = await userService.getCurrentUserId(getCurrentIdentity(req.currentUser, NIL), NIL);

      // TODO: define body type in request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body = req.body as any;
      const response = await noteService.createNote({ ...body, createdBy: userId });
      res.status(200).send(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  async listNotes(req: Request<{ activityId: string }>, res: Response, next: NextFunction) {
    try {
      const response = await noteService.listNotes(req.params.activityId);
      res.status(200).send(response);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
