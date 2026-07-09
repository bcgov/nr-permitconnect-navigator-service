import {
  createAccessRequestService,
  getAccessRequestsService,
  processAccessRequestService
} from '../services/accessRequest.ts';

import type { Request, Response } from 'express';
import type { AccessRequest, LocalContext, User } from '../types/index.ts';

export const createUserAccessRequestController = async (
  req: Request<never, never, { accessRequest: AccessRequest & { update: boolean }; user: User }>,
  res: Response<unknown, LocalContext>
) => {
  const response = await createAccessRequestService(
    res.locals.currentContext,
    res.locals.currentAuthorization,
    req.body.accessRequest,
    req.body.user
  );
  res.status(response.isAdmin ? 200 : 201).json(response.data);
};

export const processUserAccessRequestController = async (
  req: Request<{ accessRequestId: string }, never, { approve: boolean }>,
  res: Response<unknown, LocalContext>
) => {
  await processAccessRequestService(res.locals.currentContext, req.params.accessRequestId, req.body.approve);
  res.status(204).end();
};

export const getAccessRequestsController = async (req: Request, res: Response) => {
  const response = await getAccessRequestsService(res.locals.currentContext.initiative);
  res.status(200).json(response);
};
