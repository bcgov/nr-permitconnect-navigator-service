import { NIL } from 'uuid';

import { getDocument } from '../services/document';
import { getDraft } from '../services/draft';
import { getElectrificationProject, searchElectrificationProjects } from '../services/electrificationProject';
import { getEnquiry } from '../services/enquiry';
import { getHousingProject, searchHousingProjects } from '../services/housingProject';
import { getNoteHistory } from '../services/noteHistory';
import { getPermit } from '../services/permit';
import { getCurrentUserId } from '../services/user';
import {
  getGroupPolicyDetails,
  getPCNSGroupPolicyDetails,
  getPolicyAttributes,
  getSubjectGroups
} from '../services/yars';
import { Initiative, GroupName } from '../utils/enums/application';
import { Problem } from '../utils';
import { getCurrentSubject, getCurrentUsername } from '../utils/utils';

import type { NextFunction, Request, Response } from 'express';
import type { CurrentAuthorization } from '../types';

/**
 * @function hasAuthorization
 * Obtains the groups for the current users identity
 * Obtains the full permission mappings for the given resource/action pair for any of the users groups
 * 403 if none are found
 * @param {string} resource a resource name
 * @param {string} action an action name
 * @returns {function} Express middleware function
 * @throws The error encountered upon failure
 */
export const hasAuthorization = (resource: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentAuthorization: CurrentAuthorization = {
        attributes: [],
        groups: []
      };

      if (req.currentContext) {
        const userId = await getCurrentUserId(getCurrentSubject(req.currentContext), NIL);

        if (!userId) {
          throw new Error('Invalid user');
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub = (req.currentContext?.tokenPayload as any).sub;

        const groups = await getSubjectGroups(sub);

        if (groups.length === 0) {
          throw new Error('Invalid group(s)');
        }

        // Permission checking for non developers
        if (!groups.find((x) => x.name === GroupName.DEVELOPER)) {
          let policyDetails;

          if (req.currentContext.initiative === Initiative.PCNS) {
            const groupNames = Array.from(new Set(groups.map((x) => x.name)));
            policyDetails = await Promise.all(
              groupNames.map((x) => {
                return getPCNSGroupPolicyDetails(x, resource, action);
              })
            ).then((x) => x.flat());
          } else {
            policyDetails = await Promise.all(
              groups.map((x) => {
                return getGroupPolicyDetails(x.groupId, resource, action, req.currentContext?.initiative as Initiative);
              })
            ).then((x) => x.flat());
          }

          if (!policyDetails || policyDetails.length === 0) {
            throw new Error('Invalid policies');
          }

          // Inject policy attributes at global level and matching users groups
          const policyAttributes = await Promise.all(
            policyDetails.map((x) => {
              return getPolicyAttributes(x.policyId as number);
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

          currentAuthorization.attributes.push(...matchingAttributes);
        } else {
          // Developers automatically go through with all scope
          currentAuthorization.attributes.push('scope:all');
        }

        // Update current authorization and freeze
        currentAuthorization.groups = groups;
        req.currentAuthorization = Object.freeze(currentAuthorization);
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

// Maps a param key to a callback function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const paramMap = new Map<string, (id: string) => any>([
  ['documentId', getDocument],
  ['draftId', getDraft],
  ['enquiryId', getEnquiry],
  ['housingProjectId', getHousingProject],
  ['electrificationProjectId', getElectrificationProject],
  ['noteHistoryId', getNoteHistory],
  ['permitId', getPermit]
]);

/**
 * @function hasAccess
 * If current scope of request is self ensure that the object being acted upon was created by the current user
 * Takes the key to be read from request params
 * Obtains callback function from paramMap
 * Compares createdBy with current userId
 * @param {string} param A route parameter string
 * @returns {function} Express middleware function
 * @throws The error encountered upon failure
 */
export const hasAccess = (param: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.currentAuthorization?.attributes.includes('scope:self')) {
        const id = req.params[param];
        const userId = await getCurrentUserId(getCurrentSubject(req.currentContext), NIL);

        let data;
        const func = paramMap.get(param);
        if (func) data = await func(id);

        if (!data || data?.createdBy !== userId) {
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

export const hasAccessPermit = (param: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.currentAuthorization?.attributes.includes('scope:self')) {
        const id = req.params[param];
        const userId = await getCurrentUserId(getCurrentSubject(req.currentContext), NIL);

        let data;
        const func = paramMap.get(param);
        if (func) data = await func(id);

        if (!data || data?.createdBy !== userId) {
          let project;
          if (req.currentContext?.initiative === Initiative.HOUSING) {
            project = (await searchHousingProjects({ activityId: [data.activityId] }))[0];
            if (
              !project ||
              project?.submittedBy.toUpperCase() !== getCurrentUsername(req.currentContext)?.toUpperCase()
            )
              throw new Error('No access');
          } else {
            project = (await searchElectrificationProjects({ activityId: [data.activityId] }))[0];
            if (!project || project?.createdBy !== req.currentContext.userId) throw new Error('No access');
          }
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
