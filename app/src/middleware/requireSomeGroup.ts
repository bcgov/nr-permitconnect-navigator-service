import { unitOfWork } from '../repository/uow.ts';
import { assignPermissions } from '../services/coms.ts';
import { Problem } from '../utils/index.ts';
import { GroupName, IdentityProviderKind, Initiative } from '../utils/enums/application.ts';

import type { NextFunction, Request, Response } from 'express';
import { assignGroup, getGroups } from '../services/helpers/yars.ts';

/**
 * Attempt to assign proponent groups to users with external IDPs
 * Rejects the request if user has no assigned group
 * @param req Express request object
 * @param res Express response object
 * @param next The next callback function
 * @returns Express middleware function
 * @throws {Problem} The error encountered upon failure
 */
export const requireSomeGroup = async (req: Request, res: Response, next: NextFunction) => {
  await unitOfWork.execute(async ({ group, initiative, subjectGroup }) => {
    const idp = res.locals.currentContext?.tokenPayload?.identity_provider;
    const sub = res.locals.currentContext?.tokenPayload?.sub;

    if (!sub) {
      throw new Problem(403, {
        detail: 'Unable to obtain token sub',
        instance: req.originalUrl
      });
    }

    let groups = await subjectGroup.getSubjectGroups(sub);

    if (idp !== IdentityProviderKind.AZUREIDIR) {
      const required = [Initiative.ELECTRIFICATION, Initiative.GENERAL, Initiative.HOUSING, Initiative.PCNS];
      const missing = required.filter((x) => !groups.some((g) => g.initiativeCode === x));

      if (missing.length) {
        await Promise.all(
          missing.map(async (x) => {
            const g = await getGroups({ group, initiative }, x);

            const groupId = g.find((x) => x.name === GroupName.PROPONENT)?.groupId;
            if (groupId) await assignGroup({ group, subjectGroup }, sub, groupId);
          })
        );

        groups = await subjectGroup.getSubjectGroups(sub);

        // Assign COMS permissions
        await assignPermissions(res.locals.currentContext, sub, groups);
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
