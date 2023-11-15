// @ts-expect-error api-problem lacks a defined interface; code still works fine
import Problem from 'api-problem';
import { AuthType } from '../components/constants';

import type { NextFunction, Request, Response } from 'express';

/**
 * @function requireSomeAuth
 * Rejects the request if there is no authorization in the appropriate mode
 * @param {object} req Express request object
 * @param {object} _res Express response object
 * @param {function} next The next callback function
 * @returns {function} Express middleware function
 * @throws The error encountered upon failure
 */
export const requireSomeAuth = (req: Request, _res: Response, next: NextFunction) => {
  const authType: string | undefined = req.currentUser ? req.currentUser.authType : undefined;

  if (!authType || authType === AuthType.NONE) {
    throw new Problem(403, {
      detail: 'User lacks permission to complete this action',
      instance: req.originalUrl
    });
  }

  next();
};
