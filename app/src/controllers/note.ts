import { generateCreateStamps, generateUpdateStamps } from '../db/utils/utils';
import {
  electrificationProjectService,
  enquiryService,
  housingProjectService,
  noteHistoryService,
  noteService,
  userService
} from '../services';
import { Initiative } from '../utils/enums/application';

import type { NextFunction, Request, Response } from 'express';
import type { BringForward, Note, NoteHistory } from '../types';

const controller = {
  /**
   * @function createNoteHistory
   * Create a new note history and add the given note to it
   */
  async createNoteHistory(
    req: Request<never, never, NoteHistory & { note: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const stamps = generateCreateStamps(req.currentContext);

      const history = await noteHistoryService.createNoteHistory({
        activityId: req.body.activityId,
        bringForwardDate: req.body.bringForwardDate,
        bringForwardState: req.body.bringForwardState,
        escalateToSupervisor: req.body.escalateToSupervisor,
        escalateToDirector: req.body.escalateToDirector,
        shownToProponent: req.body.shownToProponent,
        title: req.body.title,
        type: req.body.type,
        isDeleted: false,
        ...stamps
      });

      const response = await noteService.createNote({
        noteHistoryId: history.noteHistoryId,
        note: req.body.note,
        ...stamps
      });
      res.status(201).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  /**
   * @function deleteNoteHistory
   * Soft delete the given note history
   */
  async deleteNoteHistory(req: Request<{ noteHistoryId: string }>, res: Response, next: NextFunction) {
    try {
      const response = await noteHistoryService.deleteNoteHistory(
        req.params.noteHistoryId,
        generateUpdateStamps(req.currentContext)
      );

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
      // let response = new Array<BringForward>();
      // const notes = await noteService.listBringForward(
      //   req.currentContext.initiative as Initiative,
      //   req.query.bringForwardState
      // );
      // if (notes && notes.length) {
      //   const projects = (
      //     await Promise.all([
      //       electrificationProjectService.searchElectrificationProjects({
      //         activityId: notes.map((x) => x.activityId)
      //       }),
      //       housingProjectService.searchHousingProjects({
      //         activityId: notes.map((x) => x.activityId)
      //       })
      //     ])
      //   ).flatMap((x) => x);

      //   const users = await userService.searchUsers({
      //     userId: notes
      //       .map((x) => x.createdBy)
      //       .filter((x) => !!x)
      //       .map((x) => x as string)
      //   });

      //   const enquiries = (
      //     await Promise.all([
      //       enquiryService.searchEnquiries(
      //         {
      //           activityId: notes.map((x) => x.activityId)
      //         },
      //         Initiative.ELECTRIFICATION
      //       ),
      //       enquiryService.searchEnquiries(
      //         {
      //           activityId: notes.map((x) => x.activityId)
      //         },
      //         Initiative.HOUSING
      //       )
      //     ])
      //   ).flatMap((x) => x);

      //   response = notes.map((note) => ({
      //     activityId: note.activityId,
      //     noteId: note.noteId as string,
      //     electrificationProjectId: projects.find((s) => s.activityId === note.activityId)
      //       ?.electrificationProjectId as string,
      //     housingProjectId: projects.find((s) => s.activityId === note.activityId)?.housingProjectId as string,
      //     enquiryId: enquiries.find((s) => s.activityId === note.activityId)?.enquiryId as string,
      //     title: note.title,
      //     projectName: projects.find((s) => s.activityId === note.activityId)?.projectName ?? null,
      //     createdByFullName: users.find((u) => u?.userId === note.createdBy)?.fullName ?? null,
      //     bringForwardDate: note.bringForwardDate as string
      //   }));
      // }
      //res.status(200).json(response);
      res.status(200).json([]);
    } catch (e: unknown) {
      next(e);
    }
  },

  /**
   * @function listNoteHistory
   * Get a list of all note histories for the given activityId
   */
  async listNoteHistory(req: Request<{ activityId: string }>, res: Response, next: NextFunction) {
    try {
      const response = await noteHistoryService.listNoteHistory(req.params.activityId);
      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  /**
   * @function addNote
   * Adds a new note to an existing history
   */
  async addNote(req: Request<never, never, Note>, res: Response, next: NextFunction) {
    try {
      const response = await noteService.createNote({
        ...req.body,
        ...generateCreateStamps(req.currentContext)
      });

      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
