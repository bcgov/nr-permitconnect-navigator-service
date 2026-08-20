import { hasIdentity as hasIdentityUtil, Problem } from '#src/utils/index';

import type { NextFunction, Request, Response } from 'express';
import type { IdentityProviderKind } from '#src/utils/enums/application';

/**
 * Verify requesting user has necessary identity
 * @param identityKind The kind of identity provider
 * @returns Express middleware function
 */
export const hasIdentity = (identityKind: IdentityProviderKind) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!hasIdentityUtil(identityKind, res.locals.currentContext)) {
      throw new Problem(403, { detail: 'Invalid user identity' });
    }
    return next();
  };
};
