import { transactionWrapper } from '../db/utils/transactionWrapper.ts';
import { getGroupPermissions, getGroups, getSubjectGroups, removeGroup } from '../services/yars.ts';
import { Initiative } from '../utils/enums/application.ts';

import type { Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/dataConnection.ts';

export const getGroupsController = async (
  req: Request<never, never, never, { initiative: Initiative }>,
  res: Response
) => {
  const response = await transactionWrapper(async (tx: PrismaTransactionClient) => {
    return await getGroups(tx, req.query.initiative);
  });
  res.status(200).json(response);
};

export const getPermissionsController = async (req: Request, res: Response) => {
  const response = await transactionWrapper(async (tx: PrismaTransactionClient) => {
    const groups = await getSubjectGroups(tx, req.currentContext.tokenPayload?.sub as string);
    const permissions = await Promise.all(groups.map((x) => getGroupPermissions(tx, x.groupId))).then((x) => x.flat());

    return { groups, permissions };
  });
  res.status(200).json({ groups: response.groups, permissions: response.permissions });
};

export const deleteSubjectGroupController = async (
  req: Request<never, never, { sub: string; groupId: number }>,
  res: Response
) => {
  await transactionWrapper(async (tx: PrismaTransactionClient) => {
    await removeGroup(tx, req.body.sub, req.body.groupId);
  });
  res.status(204).end();
};
