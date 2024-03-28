import { NIL } from 'uuid';

import { getCurrentIdentity } from '../components/utils';
import { noteService, userService } from '../services';

import type { NextFunction, Request, Response } from '../interfaces/IExpress';
import { BringForward } from '../types';

const controller = {
  async createNote(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await userService.getCurrentUserId(getCurrentIdentity(req.currentUser, NIL), NIL);
      // TODO: define body type in request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body = req.body as any;
      const response = await noteService.createNote({ ...body, createdBy: userId });
      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  async listBringForward(req: Request, res: Response, next: NextFunction) {
    try {
      let response = new Array<BringForward>();
      const notes = await noteService.listBringForward();
      if (notes && notes.length) {
        const submissions = await submissionService.searchSubmissions({ activityId: notes.map((x) => x.activityId) });
        const users = await userService.searchUsers({
          userId: notes
            .map((x) => x.createdBy)
            .filter((x) => !!x)
            .map((x) => x as string)
        });
        response = notes.map((note) => ({
          activityId: note.activityId,
          noteId: note.noteId,
          title: note.title,
          projectName: submissions.find((s) => s?.activityId === note.activityId)?.projectName ?? null,
          createdByFullName: users.find((u) => u?.userId === note.createdBy)?.fullName ?? null,
          bringForwardDate: note.bringForwardDate
        }));
      }
      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  async listNotes(req: Request<{ activityId: string }>, res: Response, next: NextFunction) {
    try {
      const response = await noteService.listNotes(req.params.activityId);
      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
