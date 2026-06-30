import { isTruthy } from '../utils/utils.ts';
import { searchUsersService } from '../services/user.ts';

import type { Request, Response } from 'express';
import type { User, UserSearchParameters } from '../types/index.ts';

export const searchUsersController = async (
  req: Request<never, never, UserSearchParameters, never>,
  res: Response<User[]>
) => {
  const response = await searchUsersService({
    userId: req.body.userId,
    idp: req.body.idp,
    sub: req.body.sub,
    email: req.body.email,
    firstName: req.body.firstName,
    fullName: req.body.fullName,
    lastName: req.body.lastName,
    active: isTruthy(req.body.active),
    group: req.body.group,
    initiative: req.body.initiative,
    includeUserGroups: isTruthy(req.body.includeUserGroups)
  });

  res.status(200).json(response);
};
