import { transactionWrapper } from '../db/utils/transactionWrapper.ts';
import { assignPermissions } from '../services/coms.ts';
import { assignGroup, getGroups, getSubjectGroups } from '../services/yars.ts';
import { Problem } from '../utils/index.ts';
import { GroupName, IdentityProviderKind, Initiative } from '../utils/enums/application.ts';

import type { NextFunction, Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/dataConnection.ts';

/**
 * Attempt to assign proponent groups to users with external IDPs
 * Rejects the request if user has no assigned group
 * @param req Express request object
 * @param _res Express response object
 * @param next The next callback function
 * @returns Express middleware function
 * @throws {Problem} The error encountered upon failure
 */
export const requireSomeGroup = async (req: Request, _res: Response, next: NextFunction) => {
  await transactionWrapper<void>(async (tx: PrismaTransactionClient) => {
    const idp = req.currentContext?.tokenPayload?.identity_provider;
    const sub = req.currentContext?.tokenPayload?.sub;

    if (!sub) {
      throw new Problem(403, {
        detail: 'Unable to obtain token sub',
        instance: req.originalUrl
      });
    }

    let groups = await getSubjectGroups(tx, sub);

    if (idp !== IdentityProviderKind.IDIR) {
      const required = [Initiative.ELECTRIFICATION, Initiative.HOUSING, Initiative.PCNS];
      const missing = required.filter((x) => !groups.some((g) => g.initiativeCode === x));

      if (missing.length) {
        await Promise.all(
          missing.map(async (x) => {
            const g = await getGroups(tx, x);

            const groupId = g.find((x) => x.name === GroupName.PROPONENT)?.groupId;
            if (groupId) await assignGroup(tx, sub, groupId);
          })
        );

        groups = await getSubjectGroups(tx, sub);

        // Assign COMS permissions
        await assignPermissions(tx, req.currentContext);
      }
    }

    if (groups.length === 0) {
      throw new Problem(403, {
        detail: 'User lacks permission to complete this action',
        instance: req.originalUrl
      });
    }
  });

  next();
};
