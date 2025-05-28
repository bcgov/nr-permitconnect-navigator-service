import { Problem } from '../utils';
import { getChefsApiKey } from '../utils/utils';

import type { NextFunction, Request, Response } from 'express';

/**
 * @function requireChefsFormConfigData
 * Rejects the request if there is no form ID present in the request
 * or if the given Form ID/Api Key is not configured
 * @param {object} req Express request object
 * @param {object} _res Express response object
 * @param {function} next The next callback function
 * @returns {function} Express middleware function
 * @throws The error encountered upon failure
 */
export const requireChefsFormConfigData = (req: Request, _res: Response, next: NextFunction) => {
  const params = { ...req.query, ...req.params };

  if (!params.formId) {
    throw new Problem(400, {
      detail: 'Form ID not present in request.',
      instance: req.originalUrl
    });
  }

  if (!getChefsApiKey(params.formId as string)) {
    throw new Problem(501, {
      detail: 'Form not present or misconfigured.',
      instance: req.originalUrl
    });
  }

  next();
};
