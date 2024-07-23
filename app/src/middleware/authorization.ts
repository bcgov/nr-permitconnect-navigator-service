// @ts-expect-error api-problem lacks a defined interface; code still works fine
import Problem from 'api-problem';

import { userService, yarsService } from '../services';

import type { NextFunction, Request, Response } from '../interfaces/IExpress';
import { AccessRole, Initiative, Scope } from '../utils/enums/application';
import { getCurrentIdentity } from '../utils/utils';
import { NIL } from 'uuid';

// Converts a primitive string to a Scope enum type
function convertStringToScope(value: string): Scope | undefined {
  return (Object.values(Scope) as Array<string>).includes(value) ? (value as Scope) : undefined;
}

/**
 * @function hasPermission
 * Obtains the roles for the current users identity
 * Obtains the full permission mappings for the given resource/action pair for any of the users roles
 * 403 if none are found
 * Checks for highest priority scope and injects into the currentUser
 * Defaults scope to self if none were found
 * @param {string} resource a resource name
 * @param {string} action an action name
 * @returns {function} Express middleware function
 * @throws The error encountered upon failure
 */
export const hasPermission = (resource: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.currentUser) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const identityId = (req.currentUser?.tokenPayload as any).preferred_username;

        let roles = await yarsService.getIdentityRoles(identityId);

        // Auto assign PROPONENT if user has no roles
        if (roles && roles.length === 0) {
          await yarsService.assignRole(identityId, AccessRole.PROPONENT);
          roles = await yarsService.getIdentityRoles(identityId);
        }

        const userId = await userService.getCurrentUserId(getCurrentIdentity(req.currentUser, NIL), NIL);

        if (!userId) {
          throw new Error('Invalid user');
        }

        // Permission/Scope checking for non developers
        if (!roles.find((x) => x.userType === AccessRole.DEVELOPER)) {
          const permissions = await Promise.all(
            roles.map((x) =>
              yarsService.getRolePermissionDetails(
                x.roleId,
                req.currentUser?.initiative as Initiative,
                resource,
                action
              )
            )
          ).then((x) => x.flat());

          if (!permissions || permissions.length === 0) {
            throw new Error('Invalid role authorization');
          }

          const scopes = permissions
            .filter((x) => !!x.scopeName)
            .map((x) => ({ scopeName: x.scopeName as string, scopePriority: x.scopePriority as number }))
            .sort((a, b) => (a.scopePriority > b.scopePriority ? 1 : -1));

          req.currentUser.apiScope = {
            name: scopes.length ? convertStringToScope(scopes[0].scopeName) ?? Scope.SELF : Scope.SELF,
            userId: userId
          };
        } else {
          // Allow all for developers
          req.currentUser.apiScope = {
            name: Scope.ALL,
            userId: userId
          };
        }
      } else {
        throw new Error('No current user');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return next(new Problem(403, { detail: err.message, instance: req.originalUrl }));
    }

    // Continue middleware
    next();
  };
};
