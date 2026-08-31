import { createAtsClient, createAtsEnquiry, searchAtsUsers } from '#src/external/ats';

import type { Request, Response } from 'express';
import type { CreateAtsClientRequest, CreateAtsEnquiryRequest, LocalContext, SearchAtsUsersRequest } from '#types';

export const createAtsClientController = async (
  req: Request<never, never, CreateAtsClientRequest, never>,
  res: Response<unknown, LocalContext>
) => {
  const response = await createAtsClient(req.body, res.locals.currentContext);
  res.status(response.status).json(response.data);
};

export const createAtsEnquiryController = async (
  req: Request<never, never, CreateAtsEnquiryRequest, never>,
  res: Response<unknown, LocalContext>
) => {
  const response = await createAtsEnquiry(req.body, res.locals.currentContext);
  res.status(response.status).json(response.data);
};

export const searchAtsUsersController = async (
  req: Request<never, never, never, SearchAtsUsersRequest>,
  res: Response<unknown, LocalContext>
) => {
  const response = await searchAtsUsers(req.query);
  res.status(response.status).json(response.data);
};
