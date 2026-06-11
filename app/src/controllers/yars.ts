import { transactionWrapper } from '../db/utils/transactionWrapper.ts';
import { assignPermissions } from '../services/coms.ts';
import {
  getCorrespondingGlobalGroup,
  getGroupPermissions,
  getGroups,
  getSubjectGroups,
  removeGroup,
  subjectHasGroupName
} from '../services/yars.ts';
import { Initiative } from '../utils/enums/application.ts';
import { getLogger } from '../utils/log.ts';
import Problem from '../utils/problem.ts';

import type { Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/database.ts';

const log = getLogger(module.filename);

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

    // Double check correct COMS permissions.
    // This endpoint is called on client bootstrap, so it's a good place to verify
    //   COMS permissions without adding COMS calls to every API request.
    await assignPermissions(tx, req.currentContext, req.currentContext.tokenPayload.sub);

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
    if (!(await subjectHasGroupName(tx, req.body.sub, group?.name))) {
      const correspondingGlobalGroup = await getCorrespondingGlobalGroup(tx, req.body.groupId);
      await removeGroup(tx, req.body.sub, correspondingGlobalGroup.groupId);
    }

    // Assign new COMS permissions
    try {
      await assignPermissions(tx, req.currentContext, req.body.sub);
    } catch (e) {
      if (e instanceof Error) log.warn(e.message);
      if (e instanceof Problem) log.warn(e.detail);
    }
  });
  res.status(204).end();
};
