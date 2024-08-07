// @ts-expect-error api-problem lacks a defined interface; code still works fine
import Problem from 'api-problem';
import { NIL } from 'uuid';

import { submissionService, userService, yarsService } from '../services';
import { Initiative, GroupName } from '../utils/enums/application';
import { getCurrentIdentity } from '../utils/utils';

import type { NextFunction, Request, Response } from '../interfaces/IExpress';

/**
 * @function hasPermission
 * Obtains the groups for the current users identity
 * Obtains the full permission mappings for the given resource/action pair for any of the users groups
 * 403 if none are found
 * @param {string} resource a resource name
 * @param {string} action an action name
 * @returns {function} Express middleware function
 * @throws The error encountered upon failure
 */
export const hasPermission = (resource: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.currentContext) {
        const userId = await userService.getCurrentUserId(getCurrentIdentity(req.currentContext, NIL), NIL);

        if (!userId) {
          throw new Error('Invalid user');
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const identityId = (req.currentContext?.tokenPayload as any).preferred_username;

        let groups = await yarsService.getIdentityGroups(identityId);

        // Auto assign all PROPONENT groups if user has none
        if (groups && groups.length === 0) {
          await yarsService.assignGroup(identityId, Initiative.HOUSING, GroupName.PROPONENT);
          groups = await yarsService.getIdentityGroups(identityId);
        }

        if (groups.length === 0) {
          throw new Error('Invalid group(s)');
        }

        // Permission checking for non developers
        if (!groups.find((x) => x.groupName === GroupName.DEVELOPER)) {
          const policyDetails = await Promise.all(
            groups.map((x) => {
              const initiative = req.currentContext?.initiative as Initiative;

              return yarsService.getGroupPolicyDetails(x.groupId, initiative, resource, action);
            })
          ).then((x) => x.flat());

          if (!policyDetails || policyDetails.length === 0) {
            throw new Error('Invalid policies(s)');
          }

          // Inject policy attributes at global level and matching users groups
          const policyAttributes = await Promise.all(
            policyDetails.map((x) => {
              return yarsService.getPolicyAttributes(x.policyId as number);
            })
          ).then((x) => x.flat());

          const matchingAttributes: Array<string> = [];
          for (const attribute of policyAttributes) {
            if (attribute.groupId.length === 0) {
              matchingAttributes.push(attribute.attributeName);
            } else {
              const filter = attribute.groupId.filter((x) => groups.some((y) => y.groupId === x));
              if (filter.length > 0) matchingAttributes.push(attribute.attributeName);
            }
          }

          req.currentContext.attributes.push(...matchingAttributes);
        } else {
          // Developers automatically go through with all scope
          req.currentContext.attributes.push('scope:all');
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

// WIP
// Takes the key to be read from params
// Gets object in question (somehow from right table... idk yet)
// Compares createdBy with current userId
export const hasAccess = (param: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.currentContext?.attributes.includes('scope:self')) {
        const id = req.params[param];

        const userId = await userService.getCurrentUserId(getCurrentIdentity(req.currentContext, NIL), NIL);

        const data = await submissionService.getSubmission(id);

        if (data?.createdBy !== userId) {
          throw new Error('No access');
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return next(new Problem(403, { detail: err.message, instance: req.originalUrl }));
    }

    // Continue middleware
    next();
  };
};
