import { searchUsersService } from '#src/services/user';

import type { Request, Response } from 'express';
import type { GroupName, Initiative } from '#src/utils/enums/application';
import type { SearchUsersRequest, User } from '#types';

export const searchUsersController = async (
  req: Request<never, never, SearchUsersRequest, never>,
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
    active: req.body.active,
    group: req.body.group as GroupName[] | undefined,
    initiative: req.body.initiative as Initiative[] | undefined,
    includeUserGroups: req.body.includeUserGroups
  });

  res.status(200).json(response);
};
