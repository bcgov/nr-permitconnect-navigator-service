import { searchIdirUsers } from '#src/external/sso';

import type { Request, Response } from 'express';
import type { SearchIdirUsersRequest } from '#types';

export const searchIdirUsersController = async (
  req: Request<never, never, never, SearchIdirUsersRequest>,
  res: Response
) => {
  const response = await searchIdirUsers(req.query);
  res.status(response.status).json(response.data);
};
