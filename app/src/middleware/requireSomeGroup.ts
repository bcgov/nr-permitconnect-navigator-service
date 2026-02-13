import { transactionWrapper } from '../db/utils/transactionWrapper.ts';
import { assignGroup, getGroups, getSubjectGroups } from '../services/yars.ts';
import { Problem } from '../utils/index.ts';
import { GroupName, IdentityProvider, Initiative } from '../utils/enums/application.ts';

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const idp = (req.currentContext?.tokenPayload as any).identity_provider;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sub = (req.currentContext?.tokenPayload as any).sub;

    let groups = await getSubjectGroups(tx, sub);

    if (idp !== IdentityProvider.IDIR) {
      const required = [Initiative.ELECTRIFICATION, Initiative.GENERAL, Initiative.HOUSING, Initiative.PCNS];
      const missing = required.filter((x) => !groups.some((g) => g.initiativeCode === x));
      await Promise.all(
        missing.map(async (x) => {
          const g = await getGroups(tx, x);

          await assignGroup(
            tx,
            req.currentContext.bearerToken,
            sub,
            g.find((x) => x.name === GroupName.PROPONENT)?.groupId
          );
        })
      );

      groups = await getSubjectGroups(tx, sub);
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
