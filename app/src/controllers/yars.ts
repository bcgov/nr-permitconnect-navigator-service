import {
  deleteSubjectGroupService,
  getGroupsService,
  listPermissionsService,
  listSubjectPermissionsService
} from '../services/yars.ts';
import { GroupName, Initiative } from '../utils/enums/application.ts';

import type { Request, Response } from 'express';
import { LocalContext } from '../types/stuff';

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
