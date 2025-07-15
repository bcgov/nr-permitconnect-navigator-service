import { getGroupPermissions, getGroups, getSubjectGroups, removeGroup } from '../services/yars';
import { Initiative } from '../utils/enums/application';

import type { Request, Response } from 'express';

export const getGroupsController = async (
  req: Request<never, never, never, { initiative: Initiative }>,
  res: Response
) => {
  const response = await getGroups(req.query.initiative);
  res.status(200).json(response);
};

export const getPermissionsController = async (req: Request, res: Response) => {
  const groups = await getSubjectGroups(req.currentContext.tokenPayload?.sub as string);
  const permissions = await Promise.all(groups.map((x) => getGroupPermissions(x.groupId))).then((x) => x.flat());
  res.status(200).json({ groups: groups, permissions });
};

export const deleteSubjectGroupController = async (
  req: Request<never, never, { sub: string; groupId: number }>,
  res: Response
) => {
  const response = await removeGroup(req.body.sub, req.body.groupId);
  res.status(200).json(response);
};
