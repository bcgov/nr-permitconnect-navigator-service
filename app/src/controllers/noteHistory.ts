import { v4 as uuidv4 } from 'uuid';

import { transactionWrapper } from '../db/utils/transactionWrapper';
import { PrismaTransactionClient } from '../db/dataConnection';
import { generateCreateStamps, generateNullUpdateStamps, generateUpdateStamps } from '../db/utils/utils';
import { searchElectrificationProjects } from '../services/electrificationProject';
import { searchEnquiries } from '../services/enquiry';
import { searchHousingProjects } from '../services/housingProject';
import { createNote } from '../services/note';
import {
  createNoteHistory,
  deleteNoteHistory,
  getNoteHistory,
  listBringForward,
  listNoteHistory,
  updateNoteHistory
} from '../services/noteHistory';
import { searchUsers } from '../services/user';
import { Initiative } from '../utils/enums/application';
import { BringForwardType } from '../utils/enums/projectCommon';

import type { Request, Response } from 'express';
import type { BringForward, Note, NoteHistory } from '../types';

/**
 * @function createNoteHistoryController
 * Create a new note history and add the given note to it
 */
export const createNoteHistoryController = async (
  req: Request<never, never, NoteHistory & { note: string }>,
  res: Response
) => {
  const { note, ...history } = req.body;

  const response = await transactionWrapper<{ historyRes: NoteHistory; noteRes: Note }>(
    async (tx: PrismaTransactionClient) => {
      const historyRes = await createNoteHistory(tx, {
        ...history,
        noteHistoryId: uuidv4(),
        isDeleted: false,
        ...generateCreateStamps(req.currentContext)
      });

      const noteRes = await createNote(tx, {
        noteId: uuidv4(),
        noteHistoryId: historyRes.noteHistoryId,
        note: note,
        ...generateCreateStamps(req.currentContext),
        ...generateNullUpdateStamps()
      });

      return { historyRes, noteRes };
    }
  );

  res.status(201).json({ ...response.historyRes, note: [response.noteRes] });
};

/**
 * @function deleteNoteHistoryController
 * Soft delete the given note history
 */
export const deleteNoteHistoryController = async (req: Request<{ noteHistoryId: string }>, res: Response) => {
  await transactionWrapper<void>(async (tx: PrismaTransactionClient) => {
    await deleteNoteHistory(tx, req.params.noteHistoryId, generateUpdateStamps(req.currentContext));
  });

  res.status(204).end();
};

export const listBringForwardController = async (
  req: Request<never, never, never, { bringForwardState?: BringForwardType }>,
  res: Response
) => {
  const response = await transactionWrapper<BringForward[]>(async (tx: PrismaTransactionClient) => {
    const history: NoteHistory[] = await listBringForward(
      tx,
      req.currentContext.initiative as Initiative,
      req.query.bringForwardState
    );

    if (history && history.length) {
      const [elecProj, housingProj] = await Promise.all([
        searchElectrificationProjects(tx, {
          activityId: history.map((x) => x.activityId)
        }),
        searchHousingProjects(tx, {
          activityId: history.map((x) => x.activityId)
        })
      ]);

      const users = await searchUsers(tx, {
        userId: history
          .map((x) => x.createdBy)
          .filter((x) => !!x)
          .map((x) => x as string)
      });

      const enquiries = (
        await Promise.all([
          searchEnquiries(
            tx,
            {
              activityId: history.map((x) => x.activityId)
            },
            Initiative.ELECTRIFICATION
          ),
          searchEnquiries(
            tx,
            {
              activityId: history.map((x) => x.activityId)
            },
            Initiative.HOUSING
          )
        ])
      ).flatMap((x) => x);

      return history.map((h) => ({
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
    } else {
      return [];
    }
  });
  res.status(200).json(response);
};

/**
 * @function listNoteHistoryController
 * Get a list of all note histories for the given activityId
 */
export const listNoteHistoryController = async (req: Request<{ activityId: string }>, res: Response) => {
  const response = await transactionWrapper<NoteHistory[]>(async (tx: PrismaTransactionClient) => {
    return await listNoteHistory(tx, req.params.activityId);
  });

  // Only return notes flagged as shown when called by proponent
  if (req.currentAuthorization?.attributes.includes('scope:self')) {
    const filtered = response.filter((x) => x.shownToProponent);
    res.status(200).json(filtered);
  } else {
    res.status(200).json(response);
  }
};

/**
 * @function updateNoteHistoryController
 * Updates a note history
 * Adds a new note to an existing history if one was given
 */
export const updateNoteHistoryController = async (
  req: Request<{ noteHistoryId: string }, never, NoteHistory & { note: string | undefined }>,
  res: Response
) => {
  const response = await transactionWrapper<NoteHistory>(async (tx: PrismaTransactionClient) => {
    const { note, ...history } = req.body;

    await updateNoteHistory(tx, {
      ...history,
      noteHistoryId: req.params.noteHistoryId,
      isDeleted: false,
      ...generateUpdateStamps(req.currentContext)
    });

    if (note) {
      await createNote(tx, {
        noteHistoryId: req.params.noteHistoryId,
        noteId: uuidv4(),
        note: note,
        ...generateCreateStamps(req.currentContext),
        ...generateNullUpdateStamps()
      });
    }

    return await getNoteHistory(tx, req.params.noteHistoryId);
  });

  res.status(200).json(response);
};
