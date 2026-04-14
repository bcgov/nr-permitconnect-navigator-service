import config from 'config';

import { setAuthHeader } from './providers/oidc.ts';
import { Problem } from '../utils/index.ts';
import { AuthType } from '../utils/enums/application.ts';

import type { NextFunction, Request, Response } from 'express';

/**
 * Rejects the request if there is no authorization in the appropriate mode
 * @param req Express request object
 * @param res Express response object
 * @param next The next callback function
 * @returns Express middleware next function.
 */
export const requireSomeAuth = (req: Request, res: Response, next: NextFunction) => {
  const authType: string | undefined = req.currentContext ? req.currentContext.authType : undefined;

  if (!authType || authType === AuthType.NONE) {
    const audience: string = config.get('server.oidc.audience');
    setAuthHeader(res, { realm: audience });
    // Problem is a 401 due to missing authentication as all other errors are handled in authentication middleware
    return next(new Problem(401, { detail: 'Missing authentication', instance: req.originalUrl }));
  }

  next();
};
