import {
  createNoteHistoryService,
  deleteNoteHistoryService,
  listBringForwardsService,
  listNoteHistoriesService,
  updateNoteHistoryService
} from '#src/services/noteHistory';
import { Initiative } from '#src/utils/enums/application';

import type { Request, Response } from 'express';
import type { BringForward, LocalContext, NoteHistory } from '#types';
import type { Resource } from '#src/utils/enums/application';
import type { BringForwardType } from '#src/utils/enums/projectCommon';

export const createNoteHistoryController = async (
  req: Request<never, never, NoteHistory & { note: string }>,
  res: Response
) => {
  const { note, ...history } = req.body;
  const response = await createNoteHistoryService(history, note);
  res.status(201).json(response);
};

export const deleteNoteHistoryController = async (req: Request<{ noteHistoryId: string }>, res: Response) => {
  await deleteNoteHistoryService(req.params.noteHistoryId);
  res.status(204).end();
};

export const listBringForwardsController = async (
  req: Request<never, never, never, { bringForwardState?: BringForwardType }>,
  res: Response<BringForward[], LocalContext>
) => {
  const initiativeCode = res.locals.currentContext.initiative;
  const response = await listBringForwardsService(
    initiativeCode !== Initiative.PCNS ? initiativeCode : undefined,
    req.query.bringForwardState
  );
  res.status(200).json(response);
};

export const listNoteHistoriesController = async (
  req: Request<{ activityId: string }>,
  res: Response<NoteHistory[], LocalContext>
) => {
  const response = await listNoteHistoriesService(res.locals.currentAuthorization, req.params.activityId);
  res.status(200).json(response);
};

export const patchNoteHistoryController = async (
  req: Request<{ noteHistoryId: string }, never, PatchNoteHistoryRequest>,
  res: Response<NoteHistory, LocalContext>
) => {
  const { note, resource, ...data } = req.body;
  const response = await patchNoteHistoryService(
    req.params.noteHistoryId,
    res.locals.currentAuthorization,
    res.locals.currentContext,
    data,
    note,
    resource
  );
  res.status(200).json(response);
};
