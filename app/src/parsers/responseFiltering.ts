import { Problem } from '#src/utils/index';

import type { CurrentAuthorization, CurrentContext } from '#types';

/**
 * Resolves the user ID to scope DB queries to when the current authorization is scope:self
 * @param currentAuthorization - Authorizations assigned to the current authorized user
 * @param currentContext - Context data of current request
 * @returns The user ID for scope:self, otherwise undefined
 * @throws {Problem} 403 when scope:self but no user ID, as an unscoped query would return everything
 */
export const getScopeUserId = (
  currentAuthorization: CurrentAuthorization,
  currentContext: CurrentContext
): string | undefined => {
  if (!currentAuthorization?.attributes.includes('scope:self')) return undefined;

  if (!currentContext?.userId) {
    throw new Problem(403, { detail: 'Unable to determine user' });
  }

  return currentContext.userId;
};
