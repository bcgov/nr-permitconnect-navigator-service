// @ts-expect-error api-problem lacks a defined interface; code still works fine
import Problem from 'api-problem';

import { ACCESS_ROLES_LIST } from '../utils/constants/application';

import type { NextFunction, Request, Response } from '../interfaces/IExpress';

/**
 * @function hasAccess
 * Check if the currentUser has at least one assigned role
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next The next callback function
 * @returns {function} Express middleware function
 * @throws The error encountered upon failure
 */
export const hasAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: Can we expand tokenPayload to include client_roles?
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const roles = (req.currentUser?.tokenPayload as any)?.client_roles;
    if (!roles || ACCESS_ROLES_LIST.some((r) => roles.includes(r))) {
      throw new Error('Invalid role authorization');
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return next(new Problem(403, { detail: err.message, instance: req.originalUrl }));
  }

  // Continue middleware
  next();
};
