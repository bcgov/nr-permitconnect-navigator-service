import { Problem } from '#src/utils/index';

import type { NextFunction, Request, Response } from 'express';
import type { ZodIssue, ZodType } from 'zod';

// e.g. prop="body", issue.path=["email"] -> "body.email: Required"; path=[] -> "body: Required"
const formatIssue = (prop: string, issue: ZodIssue) => {
  const field = issue.path.length ? `${prop}.${issue.path.join('.')}` : prop;
  return `${field}: ${issue.message}`;
};

/**
 * Performs express request validation against a specified `schema`
 * @param schema An object containing zod validation schema definitions
 * @returns Express middleware function
 * @throws {Problem} The error encountered upon failure
 */
export const validate = (schema: Record<string, ZodType>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed: [string, unknown][] = [];
    const validationErrors = Object.entries(schema)
      .map(([prop, def]) => {
        const result = def.safeParse((req as unknown as Record<string, unknown>)[prop]);
        if (!result.success) return [prop, result.error.issues] as [string, ZodIssue[]];
        parsed.push([prop, result.data]);
        return undefined;
      })
      .filter((error): error is [string, ZodIssue[]] => !!error);

    if (validationErrors.length) {
      new Problem(
        422,
        {
          detail: validationErrors
            .flatMap(([prop, issues]) => issues.map((issue) => formatIssue(prop, issue)))
            .join('; ')
        },
        { errors: Object.fromEntries(validationErrors) }
      ).send(req, res);
    } else {
      // req.query is a getter-only, recomputed-per-access property in Express 5 - plain assignment
      // silently no-ops, so redefine the property outright to persist zod's coerced/defaulted output.
      for (const [prop, data] of parsed) {
        Object.defineProperty(req, prop, { value: data, writable: true, configurable: true, enumerable: true });
      }
      next();
    }
  };
};
