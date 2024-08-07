// @ts-expect-error api-problem lacks a defined interface; code still works fine
import Problem from 'api-problem';

import { Initiative } from '../utils/enums/application';

import type { NextFunction, Request, Response } from '../interfaces/IExpress';

/**
 * @function setInitiative
 * Injects the given initiative into the currentContext
 * @param {string} initiative An initiative code
 * @returns {function} Express middleware function
 * @throws The error encountered upon failure
 */
export const setInitiative = (initiative: Initiative) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.currentContext) {
        req.currentContext.initiative = initiative;
      } else {
        throw new Problem(403, {
          detail: 'Unable to set route initiative',
          instance: req.originalUrl
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return next(new Problem(403, { detail: err.message, instance: req.originalUrl }));
    }

    // Continue middleware
    next();
  };
};
