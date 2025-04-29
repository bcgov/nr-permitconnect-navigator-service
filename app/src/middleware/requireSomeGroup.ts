// @ts-expect-error api-problem lacks a defined interface; code still works fine
import Problem from 'api-problem';

import { yarsService } from '../services';
import { GroupName, Initiative } from '../utils/enums/application';

import type { NextFunction, Request, Response } from 'express';

/**
 * @function requireSomeGroup
 * Attempt to assign default groups if user has no group
 * Rejects the request if user has no assigned group
 * @param {object} req Express request object
 * @param {object} _res Express response object
 * @param {function} next The next callback function
 * @returns {function} Express middleware function
 * @throws The error encountered upon failure
 */
export const requireSomeGroup = async (req: Request, _res: Response, next: NextFunction) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sub = (req.currentContext?.tokenPayload as any).sub;

  let groups = await yarsService.getSubjectGroups(sub);

  // Auto assign all PROPONENT groups if user has none
  if (groups && groups.length === 0) {
    const e = await yarsService.getGroups(Initiative.ELECTRIFICATION);
    const h = await yarsService.getGroups(Initiative.HOUSING);
    const p = await yarsService.getGroups(Initiative.PCNS);

    await yarsService.assignGroup(
      req.currentContext.bearerToken,
      sub,
      e.find((x) => x.name === GroupName.PROPONENT)?.groupId
    );
    await yarsService.assignGroup(
      req.currentContext.bearerToken,
      sub,
      h.find((x) => x.name === GroupName.PROPONENT)?.groupId
    );
    await yarsService.assignGroup(
      req.currentContext.bearerToken,
      sub,
      p.find((x) => x.name === GroupName.PROPONENT)?.groupId
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
