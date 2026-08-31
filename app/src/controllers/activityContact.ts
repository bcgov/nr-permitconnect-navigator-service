import {
  createActivityContactService,
  deleteActivityContactService,
  listActivityContactsService,
  updateActivityContactService
} from '#src/services/activityContact';
import { ActivityContactRole } from '#src/utils/enums/projectCommon';

import type { Request, Response } from 'express';
import type { ActivityContact, CreateActivityContactRequest, LocalContext, UpdateActivityContactRequest } from '#types';

export const createActivityContactController = async (
  req: Request<{ activityId: string; contactId: string }, never, CreateActivityContactRequest>,
  res: Response<ActivityContact, LocalContext>
) => {
  const response = await createActivityContactService(
    res.locals.currentAuthorization,
    res.locals.currentContext,
    req.params.activityId,
    req.params.contactId,
    req.body.role as ActivityContactRole
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
  req: Request<{ activityId: string; contactId: string }, never, UpdateActivityContactRequest>,
  res: Response
) => {
  const response = await updateActivityContactService(
    res.locals.currentAuthorization,
    res.locals.currentContext,
    req.params.activityId,
    req.params.contactId,
    req.body.role as ActivityContactRole
  );
  res.status(200).json(response);
};
