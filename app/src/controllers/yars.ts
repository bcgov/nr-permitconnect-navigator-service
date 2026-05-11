import { transactionWrapper } from '../db/utils/transactionWrapper.ts';
import {
  getCorrespondingGlobalGroup,
  getGroupPermissions,
  getGroups,
  getSubjectGroups,
  removeGroup,
  subjectHasGroupName
} from '../services/yars.ts';
import { Initiative } from '../utils/enums/application.ts';
import Problem from '../utils/problem.ts';

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
    if (!req.currentContext.tokenPayload?.sub) throw new Problem(500, { detail: 'Unable to read token sub' });

    const groups = await getSubjectGroups(tx, req.currentContext.tokenPayload.sub);
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
    const groups = await getSubjectGroups(tx, req.body.sub);
    const group = groups.find((x) => x.groupId === req.body.groupId);
    if (group?.initiativeCode === Initiative.PCNS)
      throw new Problem(422, { detail: 'Cannot delete a global group directly' });

    await removeGroup(tx, req.body.sub, req.body.groupId);

    // Only remove global perm if user has no groups of the same type assigned in other initiatives
    if (!(await subjectHasGroupName(tx, req.body.sub, [group?.name], req.currentContext.initiative))) {
      const correspondingGlobalGroup = await getCorrespondingGlobalGroup(tx, req.body.groupId);
      await removeGroup(tx, req.body.sub, correspondingGlobalGroup.groupId);
    }
  });
  res.status(204).end();
};
