import { createAtsClient, createAtsEnquiry, searchAtsUsers } from '../external/ats.ts';

import type { Request, Response } from 'express';
import type { AtsClientResource, AtsEnquiryResource, AtsUserSearchParameters, LocalContext } from '../types/index.ts';

export const createAtsClientController = async (
  req: Request<never, never, AtsClientResource, never>,
  res: Response<unknown, LocalContext>
) => {
  const response = await createAtsClient(req.body, res.locals.currentContext);
  res.status(response.status).json(response.data);
};

export const createAtsEnquiryController = async (
  req: Request<never, never, AtsEnquiryResource, never>,
  res: Response<unknown, LocalContext>
) => {
  const response = await createAtsEnquiry(req.body, res.locals.currentContext);
  res.status(response.status).json(response.data);
};

export const searchAtsUsersController = async (
  req: Request<never, never, never, AtsUserSearchParameters>,
  res: Response<unknown, LocalContext>
) => {
  const response = await searchAtsUsers(req.query);
  res.status(response.status).json(response.data);
};
