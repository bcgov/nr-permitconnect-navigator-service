/* eslint-disable @typescript-eslint/no-explicit-any */
import { Problem } from '../utils';

import type { NextFunction, Request, Response } from 'express';

/**
 * @function validator
 * Performs express request validation against a specified `schema`
 * @param {object} schema An object containing Joi validation schema definitions
 * @returns {function} Express middleware function
 * @throws The error encountered upon failure
 */
export const validate = (schema: object) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationErrors = Object.entries(schema)
      .map(([prop, def]) => {
        const result = def.validate((req as any)[prop], { abortEarly: false })?.error;
        return result ? [prop, result?.details] : undefined;
      })
      .filter((error) => !!error)
      .map((x) => x as Array<Array<string>>);

    if (Object.keys(validationErrors).length) {
      new Problem(
        422,
        {
          detail: validationErrors.flatMap((groups) => groups[1]?.map((error: any) => error?.message)).join('; ')
        },
        { errors: Object.fromEntries(validationErrors) }
      ).send(req, res);
    } else next();
  };
};
