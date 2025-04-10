import { generateCreateStamps, generateUpdateStamps } from '../db/utils/utils';
import {
  electrificationProjectService,
  enquiryService,
  housingProjectService,
  noteService,
  userService
} from '../services';

import type { NextFunction, Request, Response } from 'express';
import type { BringForward, Note } from '../types';

const controller = {
  async createNote(req: Request<never, never, Note>, res: Response, next: NextFunction) {
    try {
      const response = await noteService.createNote({
        ...req.body,
        ...generateCreateStamps(req.currentContext)
      });
      res.status(201).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  async deleteNote(req: Request<{ noteId: string }>, res: Response, next: NextFunction) {
    try {
      const response = await noteService.deleteNote(req.params.noteId, generateUpdateStamps(req.currentContext));

      if (!response) {
        return res.status(404).json({ message: 'Note not found' });
      }

      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  async listBringForward(
    req: Request<never, never, never, { bringForwardState?: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      let response = new Array<BringForward>();
      const notes = await noteService.listBringForward(req.query.bringForwardState);
      if (notes && notes.length) {
        const electrificationProjects = await electrificationProjectService.searchElectrificationProjects({
          activityId: notes.map((x) => x.activityId)
        });
        const housingProjects = await housingProjectService.searchHousingProjects({
          activityId: notes.map((x) => x.activityId)
        });
        const users = await userService.searchUsers({
          userId: notes
            .map((x) => x.createdBy)
            .filter((x) => !!x)
            .map((x) => x as string)
        });
        const enquiries = await enquiryService.searchEnquiries({
          activityId: notes.map((x) => x.activityId)
        });
        response = notes.map((note) => ({
          activityId: note.activityId,
          noteId: note.noteId as string,
          electrificationProjectId: electrificationProjects.find((s) => s.activityId === note.activityId)
            ?.electrificationProjectId as string,
          housingProjectId: housingProjects.find((s) => s.activityId === note.activityId)?.housingProjectId as string,
          enquiryId: enquiries.find((s) => s.activityId === note.activityId)?.enquiryId as string,
          title: note.title,
          projectName: housingProjects.find((s) => s.activityId === note.activityId)?.projectName ?? null,
          createdByFullName: users.find((u) => u?.userId === note.createdBy)?.fullName ?? null,
          bringForwardDate: note.bringForwardDate as string
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
  },

  async updateNote(req: Request<never, never, Note>, res: Response, next: NextFunction) {
    try {
      const response = await noteService.updateNote({
        ...req.body,
        ...generateCreateStamps(req.currentContext),
        ...generateUpdateStamps(req.currentContext)
      });

      if (!response) {
        return res.status(404).json({ message: 'Note not found' });
      }

      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
