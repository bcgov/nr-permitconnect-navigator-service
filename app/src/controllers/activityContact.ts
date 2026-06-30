import {
  createActivityContactService,
  deleteActivityContactService,
  listActivityContactsService,
  updateActivityContactService
} from '../services/activityContact.ts';
import { ActivityContactRole } from '../utils/enums/projectCommon.ts';

import type { Request, Response } from 'express';
import type { Contact, LocalContext } from '../types/index.ts';

export const createActivityContactController = async (
  req: Request<{ activityId: string; contactId: string }, never, { role: ActivityContactRole }>,
  res: Response<Contact, LocalContext>
) => {
  const response = await createActivityContactService(
    res.locals.currentAuthorization,
    res.locals.currentContext,
    req.params.activityId,
    req.params.contactId,
    req.body.role
  );
  res.status(201).json(response);
};

export const deleteActivityContactController = async (
  req: Request<{ activityId: string; contactId: string }>,
  res: Response<never, LocalContext>
) => {
  await deleteActivityContactService(res.locals.currentContext, req.params.activityId, req.params.contactId);
  res.status(204).end();
};

export const listActivityContactController = async (req: Request<{ activityId: string }>, res: Response) => {
  const response = await listActivityContactsService(req.params.activityId);
  res.status(200).json(response);
};

export const updateActivityContactController = async (
  req: Request<{ activityId: string; contactId: string }, never, { role: ActivityContactRole }>,
  res: Response
) => {
  const response = await updateActivityContactService(
    res.locals.currentAuthorization,
    res.locals.currentContext,
    req.params.activityId,
    req.params.contactId,
    req.body.role
  );
  res.status(200).json(response);
};
