import config from 'config';
import { v4 as uuidv4 } from 'uuid';

import { transactionWrapper } from '../db/utils/transactionWrapper.ts';
import {
  generateCreateStamps,
  generateDeleteStamps,
  generateNullDeleteStamps,
  generateNullUpdateStamps,
  generateUpdateStamps
} from '../db/utils/utils.ts';
import { searchElectrificationProjects } from '../services/electrificationProject.ts';
import { email } from '../services/email.ts';
import { searchEnquiries } from '../services/enquiry.ts';
import { searchHousingProjects } from '../services/housingProject.ts';
import { createNote } from '../services/note.ts';
import {
  createNoteHistory,
  deleteNoteHistory,
  getNoteHistory,
  listBringForward,
  listNoteHistory,
  updateNoteHistory
} from '../services/noteHistory.ts';
import { getProjectByActivityId } from '../services/project.ts';
import { searchUsers } from '../services/user.ts';
import { getUsersWithGroups } from './user.ts';
import { GroupName, Initiative, Resource } from '../utils/enums/application.ts';
import { BringForwardType, NoteType } from '../utils/enums/projectCommon.ts';
import { bringForwardEnquiryNotificationTemplate, bringForwardProjectNotificationTemplate } from '../utils/templates';

import type { Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/dataConnection.ts';
import type { BringForward, Note, NoteHistory, User } from '../types/index.ts';

/**
 * Create a new note history and add the given note to it
 * @param req Express Request object
 * @param res Express Response object
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
        ...generateCreateStamps(req.currentContext)
      });

      const noteRes = await createNote(tx, {
        noteId: uuidv4(),
        noteHistoryId: historyRes.noteHistoryId,
        note: note,
        ...generateCreateStamps(req.currentContext),
        ...generateNullUpdateStamps(),
        ...generateNullDeleteStamps()
      });

      return { historyRes, noteRes };
    }
  );

  res.status(201).json({ ...response.historyRes, note: [response.noteRes] });
};

/**
 * Delete the given note history
 * @param req Express Request object
 * @param res Express Response object
 */
export const deleteNoteHistoryController = async (req: Request<{ noteHistoryId: string }>, res: Response) => {
  await transactionWrapper<void>(async (tx: PrismaTransactionClient) => {
    await deleteNoteHistory(tx, req.params.noteHistoryId, generateDeleteStamps(req.currentContext));
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
      req.currentContext.initiative!,
      req.query.bringForwardState
    );

    if (history.length) {
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
          .map((x) => x!)
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
        noteId: h.noteHistoryId,
        electrificationProjectId: elecProj.find((s) => s.activityId === h.activityId)?.electrificationProjectId,
        housingProjectId: housingProj.find((s) => s.activityId === h.activityId)?.housingProjectId,
        enquiryId: enquiries.find((s) => s.activityId === h.activityId)?.enquiryId,
        title: h.title,
        projectName:
          elecProj.find((s) => s.activityId === h.activityId)?.projectName ??
          housingProj.find((s) => s.activityId === h.activityId)?.projectName ??
          null,
        createdByFullName: users.find((u) => u?.userId === h.createdBy)?.fullName ?? null,
        bringForwardDate: h.bringForwardDate?.toISOString(),
        escalateToSupervisor: h.escalateToSupervisor,
        escalateToDirector: h.escalateToDirector
      }));
    } else {
      return [];
    }
  });
  res.status(200).json(response);
};

/**
 * Get a list of all note histories for the given activityId
 * @param req Express Request object
 * @param res Express Response object
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
 * Updates a note history
 * Adds a new note to an existing history if one was given
 * @param req Express Request object
 * @param res Express Response object
 */
export const updateNoteHistoryController = async (
  req: Request<{ noteHistoryId: string }, never, NoteHistory & { note: string | undefined; resource: string }>,
  res: Response
) => {
  const response = await transactionWrapper<NoteHistory>(async (tx: PrismaTransactionClient) => {
    const { note, resource, ...history } = req.body;

    const noteHistoryResponse = await updateNoteHistory(tx, {
      ...history,
      noteHistoryId: req.params.noteHistoryId,
      ...generateUpdateStamps(req.currentContext)
    });

    if (note) {
      await createNote(tx, {
        noteHistoryId: req.params.noteHistoryId,
        noteId: uuidv4(),
        note: note,
        ...generateCreateStamps(req.currentContext),
        ...generateNullUpdateStamps(),
        ...generateNullDeleteStamps()
      });
    }

    const isNavigator = !!req.currentAuthorization?.groups.some((group) => group.name === GroupName.NAVIGATOR);
    if (isNavigator)
      await emailBringForwardNotification(tx, noteHistoryResponse, req.currentContext.initiative!, resource);

    return await getNoteHistory(tx, req.params.noteHistoryId);
  });

  res.status(200).json(response);
};

async function emailBringForwardNotification(
  tx: PrismaTransactionClient,
  noteHistory: NoteHistory,
  initiative: Initiative,
  resource: string
) {
  if (noteHistory.type !== NoteType.BRING_FORWARD || !noteHistory.escalateToSupervisor) {
    return;
  }

  const allUsers = await searchUsers(tx, { active: true });

  const supervisors = await getUsersWithGroups(tx, allUsers, {
    group: [GroupName.SUPERVISOR],
    initiative: [initiative]
  });

  const supervisorsEmails = supervisors.flatMap((user: User) => (user.email ? [user.email] : []));

  if (supervisorsEmails.length === 0) return;

  let body: string;

  if (resource === Resource.ENQUIRY) {
    body = bringForwardEnquiryNotificationTemplate({
      activityId: noteHistory.activityId
    });
  } else {
    const project = await getProjectByActivityId(tx, noteHistory.activityId);

    if (!project) return;

    body = bringForwardProjectNotificationTemplate({
      projectName: project.projectName,
      activityId: noteHistory.activityId
    });
  }

  const configCC = config.get<string>('server.ches.submission.cc');

  const emailData = {
    from: configCC,
    to: supervisorsEmails,
    subject: 'New escalation in PCNS',
    bodyType: 'html',
    body: body
  };

  await email(emailData);
}
