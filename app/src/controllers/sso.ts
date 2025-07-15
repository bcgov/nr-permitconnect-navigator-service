import { searchBasicBceidUsers, searchBusinessBceidUsers, searchIdirUsers } from '../services/sso';

import type { Request, Response } from 'express';
import type { BceidSearchParameters, IdirSearchParameters } from '../types';

export const searchIdirUsersController = async (
  req: Request<never, never, never, IdirSearchParameters>,
  res: Response
) => {
  const response = await searchIdirUsers(req.query);
  res.status(response.status).json(response.data);
};

export const searchBasicBceidUsersController = async (
  req: Request<never, never, never, BceidSearchParameters>,
  res: Response
) => {
  const response = await searchBasicBceidUsers(req.query);
  res.status(response.status).json(response.data);
};

export const searchBusinessBceidUsersController = async (
  req: Request<never, never, never, BceidSearchParameters>,
  res: Response
) => {
  const response = await searchBusinessBceidUsers(req.query);
  res.status(response.status).json(response.data);
};
