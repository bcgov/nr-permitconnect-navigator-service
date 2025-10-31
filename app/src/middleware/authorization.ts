import { transactionWrapper } from '../db/utils/transactionWrapper';
import { getDocument } from '../services/document';
import { getDraft } from '../services/draft';
import { getElectrificationProject } from '../services/electrificationProject';
import { getEnquiry } from '../services/enquiry';
import { getHousingProject } from '../services/housingProject';
import { getNoteHistory } from '../services/noteHistory';
import { getPermit } from '../services/permit';
import { getCurrentUserId } from '../services/user';
import {
  getGroupPolicyDetails,
  getPCNSGroupPolicyDetails,
  getPolicyAttributes,
  getSubjectGroups
} from '../services/yars';
import { SYSTEM_ID } from '../utils/constants/application';
import { Initiative, GroupName } from '../utils/enums/application';
import { Problem } from '../utils';
import { getCurrentSubject } from '../utils/utils';

import type { NextFunction, Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/dataConnection';
import type { CurrentAuthorization } from '../types';
import { searchContacts } from '../services/contact';
import { getActivityContacts } from '../services/activityContact';

/**
 * Obtains the groups for the current users identity
 * Obtains the full permission mappings for the given resource/action pair for any of the users groups
 * 403 if none are found
 * @param  resource a resource name
 * @param action an action name
 * @returns Express middleware function
 * @throws The error encountered upon failure
 */
export const hasAuthorization = (resource: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await transactionWrapper(async (tx: PrismaTransactionClient) => {
        const currentAuthorization: CurrentAuthorization = {
          attributes: [],
          groups: []
        };

        if (req.currentContext) {
          const userId = await getCurrentUserId(tx, getCurrentSubject(req.currentContext), SYSTEM_ID);

          if (!userId) {
            throw new Error('Invalid user');
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const sub = (req.currentContext?.tokenPayload as any).sub;

          const groups = await getSubjectGroups(tx, sub);

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
                  return getPCNSGroupPolicyDetails(tx, x, resource, action);
                })
              ).then((x) => x.flat());
            } else {
              policyDetails = await Promise.all(
                groups.map((x) => {
                  return getGroupPolicyDetails(
                    tx,
                    x.groupId,
                    resource,
                    action,
                    req.currentContext?.initiative as Initiative
                  );
                })
              ).then((x) => x.flat());
            }

            if (!policyDetails || policyDetails.length === 0) {
              throw new Error('Invalid policies');
            }

            // Inject policy attributes at global level and matching users groups
            const policyAttributes = await Promise.all(
              policyDetails.map((x) => {
                return getPolicyAttributes(tx, x.policyId as number);
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
      });
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
const paramMap = new Map<string, (tx: PrismaTransactionClient, id: string) => any>([
  ['documentId', getDocument],
  ['draftId', getDraft],
  ['enquiryId', getEnquiry],
  ['housingProjectId', getHousingProject],
  ['electrificationProjectId', getElectrificationProject],
  ['noteHistoryId', getNoteHistory],
  ['permitId', getPermit]
]);

/**
 * If current scope of request is self
 * Takes the key to be read from request params
 * Obtains callback function from paramMap
 * Ensure that the current user contact is part of the activity contact list
 * @param param A route parameter string, typically a GUID
 * @returns Express middleware function
 * @throws The error encountered upon failure
 */
export const hasAccess = (param: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await transactionWrapper<void>(async (tx: PrismaTransactionClient) => {
        if (req.currentAuthorization?.attributes.includes('scope:self')) {
          const id = req.params[param];

          let data;
          if (param !== 'activityId') {
            const func = paramMap.get(param);
            if (func) data = await func(tx, id);
          }

          const activityId = data.activityId ?? id;
          const contact = await searchContacts(tx, { userId: [req.currentContext.userId as string] });
          const activityContacts = await getActivityContacts(tx, activityId);

          if (!activityContacts?.some((ac) => ac.contactId === contact[0].contactId)) {
            throw new Error();
          }
        }
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return next(new Problem(403, { detail: err.message, instance: req.originalUrl }));
    }

    // Continue middleware
    next();
  };
};
