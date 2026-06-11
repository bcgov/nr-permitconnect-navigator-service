import { searchIdirUsers } from '../services/sso.ts';

import type { Request, Response } from 'express';
import type { IdirSearchParameters } from '../types/index.ts';

export const searchIdirUsersController = async (
  req: Request<never, never, never, IdirSearchParameters>,
  res: Response
) => {
  const response = await searchIdirUsers(req.query);
  res.status(response.status).json(response.data);
};
