import {
  deleteSubjectGroupService,
  getGroupsService,
  listPermissionsService,
  listSubjectPermissionsService
} from '#src/services/yars';

import type { Request, Response } from 'express';
import type { DeleteSubjectGroupRequest, GetGroupsRequest, ListPermissionsRequest, LocalContext } from '#types';
import type { GroupName, Initiative } from '#src/utils/enums/application';

export const getGroupsController = async (req: Request<never, never, never, GetGroupsRequest>, res: Response) => {
  const response = await getGroupsService(req.query.initiative as Initiative);
  res.status(200).json(response);
};

export const listPermissionsController = async (
  req: Request<never, never, never, ListPermissionsRequest>,
  res: Response
) => {
  const response = await listPermissionsService(req.query.initiative as Initiative, req.query.groupName as GroupName);
  res.status(200).json(response);
};

export const listSubjectPermissionsController = async (_req: Request, res: Response<unknown, LocalContext>) => {
  const response = await listSubjectPermissionsService(res.locals.currentContext);
  res.status(200).json({ groups: response.groups, permissions: response.permissions });
};

export const deleteSubjectGroupController = async (
  req: Request<never, never, DeleteSubjectGroupRequest>,
  res: Response<never, LocalContext>
) => {
  await deleteSubjectGroupService(res.locals.currentContext, req.body.sub, req.body.groupId);
  res.status(204).end();
};
