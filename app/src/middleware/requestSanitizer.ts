import type { NextFunction, Request, Response } from 'express';

import { sanitize } from './utils.ts';

/**
 * Express middleware to sanitize incoming request bodies
 * @param req The Express request object
 * @param _res The Express response object
 * @param next The next middleware function
 */
export function requestSanitizer(req: Request, _res: Response, next: NextFunction): void {
  if (req.body !== undefined) {
    req.body = sanitize(req.body);
  }
  next();
}
