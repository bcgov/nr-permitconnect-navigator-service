import {
  createNoteHistoryService,
  deleteNoteHistoryService,
  listBringForwardsService,
  listNoteHistoriesService,
  updateNoteHistoryService
} from '../services/noteHistory.ts';

import { Resource } from '../utils/enums/application.ts';
import { BringForwardType } from '../utils/enums/projectCommon.ts';

import type { Request, Response } from 'express';
import type { BringForward, LocalContext, NoteHistory } from '../types/index.ts';

export const createNoteHistoryController = async (
  req: Request<never, never, NoteHistory & { note: string }>,
  res: Response
) => {
  const { note, ...history } = req.body;
  const response = createNoteHistoryService(history, note);
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
  const response = await listBringForwardsService(res.locals.currentContext.initiative, req.query.bringForwardState);
  res.status(200).json(response);
};

export const listNoteHistoriesController = async (
  req: Request<{ activityId: string }>,
  res: Response<NoteHistory[], LocalContext>
) => {
  const response = await listNoteHistoriesService(res.locals.currentAuthorization, req.params.activityId);
  res.status(200).json(response);
};

export const updateNoteHistoryController = async (
  req: Request<{ noteHistoryId: string }, never, NoteHistory & { note: string | undefined; resource: Resource }>,
  res: Response<NoteHistory, LocalContext>
) => {
  const { note, resource, ...history } = req.body;
  const response = await updateNoteHistoryService(
    res.locals.currentAuthorization,
    res.locals.currentContext,
    history,
    note,
    resource
  );
  res.status(200).json(response);
};
