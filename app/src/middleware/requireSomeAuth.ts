import { Problem } from '../utils';
import { AuthType } from '../utils/enums/application';

import type { NextFunction, Request, Response } from 'express';

/**
 * Rejects the request if there is no authorization in the appropriate mode
 * @param req Express request object
 * @param _res Express response object
 * @param next The next callback function
 * @returns Express middleware function
 * @throws The error encountered upon failure
 */
export const requireSomeAuth = (req: Request, _res: Response, next: NextFunction) => {
  const authType: string | undefined = req.currentContext ? req.currentContext.authType : undefined;

  if (!authType || authType === AuthType.NONE) {
    throw new Problem(403, {
      detail: 'User lacks permission to complete this action',
      instance: req.originalUrl
    });
  }

  next();
};
