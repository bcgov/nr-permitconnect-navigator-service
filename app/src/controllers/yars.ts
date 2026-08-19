import {
  deleteSubjectGroupService,
  getGroupsService,
  listPermissionsService,
  listSubjectPermissionsService
} from '#src/services/yars';

import type { Request, Response } from 'express';
import type { LocalContext } from '#types';
import type { GroupName, Initiative } from '#src/utils/enums/application';

export const getGroupsController = async (
  req: Request<never, never, never, { initiative: Initiative }>,
  res: Response
) => {
  const response = await getGroupsService(req.query.initiative);
  res.status(200).json(response);
};

export const listPermissionsController = async (
  req: Request<never, never, never, { initiative: Initiative; groupName: GroupName }>,
  res: Response
) => {
  const response = await listPermissionsService(req.query.initiative, req.query.groupName);
  res.status(200).json(response);
};

export const listSubjectPermissionsController = async (_req: Request, res: Response<unknown, LocalContext>) => {
  const response = await listSubjectPermissionsService(res.locals.currentContext);
  res.status(200).json({ groups: response.groups, permissions: response.permissions });
};

export const deleteSubjectGroupController = async (
  req: Request<never, never, { sub: string; groupId: number }>,
  res: Response<never, LocalContext>
) => {
  await deleteSubjectGroupService(res.locals.currentContext, req.body.sub, req.body.groupId);
  res.status(204).end();
};
