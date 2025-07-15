import { v4 as uuidv4 } from 'uuid';

import { generateCreateStamps, generateNullUpdateStamps, generateUpdateStamps } from '../db/utils/utils';
import {
  electrificationProjectService,
  enquiryService,
  housingProjectService,
  noteHistoryService,
  noteService,
  userService
} from '../services';
import { Initiative } from '../utils/enums/application';
import { BringForwardType } from '../utils/enums/projectCommon';

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
    const { note, ...history } = req.body;

    try {
      const historyRes: NoteHistory = await noteHistoryService.createNoteHistory({
        ...history,
        isDeleted: false,
        ...generateCreateStamps(req.currentContext)
      });

      const noteRes: Note = await noteService.createNote({
        noteId: uuidv4(),
        noteHistoryId: historyRes.noteHistoryId,
        note: note,
        ...generateCreateStamps(req.currentContext),
        ...generateNullUpdateStamps()
      });

      return res.status(201).json({ ...historyRes, note: [noteRes] });
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
      const response: NoteHistory = await noteHistoryService.deleteNoteHistory(
        req.params.noteHistoryId,
        generateUpdateStamps(req.currentContext)
      );

      if (!response) {
        return res.status(404).json({ message: 'Note not found' });
      }

      return res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  async listBringForward(
    req: Request<never, never, never, { bringForwardState?: BringForwardType }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      let response = new Array<BringForward>();

      const history: NoteHistory[] = await noteHistoryService.listBringForward(
        req.currentContext.initiative as Initiative,
        req.query.bringForwardState
      );

      if (history && history.length) {
        const [elecProj, housingProj] = await Promise.all([
          electrificationProjectService.searchElectrificationProjects({
            activityId: history.map((x) => x.activityId)
          }),
          housingProjectService.searchHousingProjects({
            activityId: history.map((x) => x.activityId)
          })
        ]);

        const users = await userService.searchUsers({
          userId: history
            .map((x) => x.createdBy)
            .filter((x) => !!x)
            .map((x) => x as string)
        });

        const enquiries = (
          await Promise.all([
            enquiryService.searchEnquiries(
              {
                activityId: history.map((x) => x.activityId)
              },
              Initiative.ELECTRIFICATION
            ),
            enquiryService.searchEnquiries(
              {
                activityId: history.map((x) => x.activityId)
              },
              Initiative.HOUSING
            )
          ])
        ).flatMap((x) => x);

        response = history.map((h) => ({
          activityId: h.activityId,
          noteId: h.noteHistoryId as string,
          electrificationProjectId: elecProj.find((s) => s.activityId === h.activityId)
            ?.electrificationProjectId as string,
          housingProjectId: housingProj.find((s) => s.activityId === h.activityId)?.housingProjectId as string,
          enquiryId: enquiries.find((s) => s.activityId === h.activityId)?.enquiryId as string,
          title: h.title,
          projectName:
            elecProj.find((s) => s.activityId === h.activityId)?.projectName ??
            housingProj.find((s) => s.activityId === h.activityId)?.projectName ??
            null,
          createdByFullName: users.find((u) => u?.userId === h.createdBy)?.fullName ?? null,
          bringForwardDate: h.bringForwardDate?.toISOString() as string
        }));
      }
      res.status(200).json(response);
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

      // Only return notes flagged as shown when called by proponent
      if (req.currentAuthorization?.attributes.includes('scope:self')) {
        const filtered = response.filter((x) => x.shownToProponent);
        return res.status(200).json(filtered);
      }

      return res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  /**
   * @function updateNoteHistory
   * Updates a note history
   * Adds a new note to an existing history if one was given
   */
  async updateNoteHistory(
    req: Request<{ noteHistoryId: string }, never, NoteHistory & { note: string | undefined }>,
    res: Response,
    next: NextFunction
  ) {
    const { note, ...history } = req.body;

    try {
      await noteHistoryService.updateNoteHistory({
        ...history,
        noteHistoryId: req.params.noteHistoryId,
        isDeleted: false,
        ...generateUpdateStamps(req.currentContext)
      });

      if (note) {
        await noteService.createNote({
          noteHistoryId: req.params.noteHistoryId,
          noteId: uuidv4(),
          note: note,
          ...generateCreateStamps(req.currentContext),
          ...generateNullUpdateStamps()
        });
      }

      return res.status(200).json(await noteHistoryService.getNoteHistory(req.params.noteHistoryId));
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
