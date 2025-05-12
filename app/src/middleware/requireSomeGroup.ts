// @ts-expect-error api-problem lacks a defined interface; code still works fine
import Problem from 'api-problem';

import { yarsService } from '../services';
import { GroupName, IdentityProvider, Initiative } from '../utils/enums/application';

import type { NextFunction, Request, Response } from 'express';

/**
 * @function requireSomeGroup
 * Attempt to assign proponent groups to users with external IDPs
 * Rejects the request if user has no assigned group
 * @param {object} req Express request object
 * @param {object} _res Express response object
 * @param {function} next The next callback function
 * @returns {function} Express middleware function
 * @throws The error encountered upon failure
 */
export const requireSomeGroup = async (req: Request, _res: Response, next: NextFunction) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const idp = (req.currentContext?.tokenPayload as any).identity_provider;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sub = (req.currentContext?.tokenPayload as any).sub;

  let groups = await yarsService.getSubjectGroups(sub);

  if (idp !== IdentityProvider.IDIR) {
    const required = [Initiative.ELECTRIFICATION, Initiative.HOUSING, Initiative.PCNS];
    const missing = required.filter((x) => !groups.some((g) => g.initiativeCode === x));
    await Promise.all(
      missing.map(async (x) => {
        const g = await yarsService.getGroups(x);

        await yarsService.assignGroup(
          req.currentContext.bearerToken,
          sub,
          g.find((x) => x.name === GroupName.PROPONENT)?.groupId
        );
      })
    );

    groups = await yarsService.getSubjectGroups(sub);
  }

  if (groups.length === 0) {
    throw new Problem(403, {
      detail: 'User lacks permission to complete this action',
      instance: req.originalUrl
    });
  }

  next();
};
