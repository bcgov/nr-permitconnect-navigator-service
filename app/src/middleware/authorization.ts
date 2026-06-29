import { unitOfWork } from '../repository/unitOfWork.ts';
import { Initiative, GroupName } from '../utils/enums/application.ts';
import { Problem } from '../utils/index.ts';
import { getCurrentSubject } from '../utils/utils.ts';

import type { NextFunction, Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/database.ts';
import type { CurrentAuthorization } from '../types/index.ts';

/**
 * Obtains the groups for the current users identity
 * Obtains the full permission mappings for the given resource/action pair for any of the users groups
 * Obtains attributes attached to any of those groups
 * 403 if none are found
 * @param  resource a resource name
 * @param action an action name
 * @returns Express middleware function
 * @throws {Problem} The error encountered upon failure
 */
export const hasAuthorization = (resource: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await unitOfWork.execute(async ({ groupRolePolicyVw, policyAttribute, subjectGroup, user }) => {
        const currentAuthorization: CurrentAuthorization = {
          attributes: [],
          groups: []
        };

        if (res.locals.currentContext) {
          const userId = await user.findFirst({
            where: {
              sub: getCurrentSubject(res.locals.currentContext)
            }
          });

          if (!userId) {
            throw new Error('Invalid user');
          }

          const sub = res.locals.currentContext?.tokenPayload?.sub;

          if (!sub) {
            throw new Error('No subject');
          }

          const groups = await subjectGroup.getSubjectGroups(sub);

          if (groups.length === 0) {
            throw new Error('Invalid group(s)');
          }

          // Permission checking for non developers
          if (!groups.find((x) => x.name === GroupName.DEVELOPER)) {
            let policyDetails;

            if (res.locals.currentContext.initiative === Initiative.PCNS) {
              const groupNames = Array.from(new Set(groups.map((x) => x.name)));
              policyDetails = await Promise.all(
                groupNames.map((x) => {
                  return groupRolePolicyVw.getPCNSGroupPolicyDetails(x, resource, action);
                })
              ).then((x) => x.flat());
            } else {
              policyDetails = await Promise.all(
                groups.map((x) => {
                  return groupRolePolicyVw.getGroupPolicyDetails(
                    x.groupId,
                    resource,
                    action,
                    res.locals.currentContext?.initiative
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
                return policyAttribute.getPolicyAttributes(x.policyId!);
              })
            ).then((x) => x.flat());

            const matchingAttributes: string[] = [];
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
          res.locals.currentAuthorization = Object.freeze(currentAuthorization);
        } else {
          throw new Error('No current user');
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        return next(new Problem(403, { detail: error.message, instance: req.originalUrl }));
      } else if (typeof error === 'string') {
        return next(new Problem(403, { detail: error, instance: req.originalUrl }));
      } else return next(new Problem(403, { instance: req.originalUrl }));
    }

    // Continue middleware
    next();
  };
};

// Maps a param key to a callback function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const paramMap = new Map<string, (tx: PrismaTransactionClient, id: string) => any>([
  ['documentId', (tx, id) => tx.document.findFirst({ where: { documentId: id } })],
  ['draftId', (tx, id) => tx.draft.findFirst({ where: { draftId: id } })],
  ['enquiryId', (tx, id) => tx.enquiry.findFirst({ where: { enquiryId: id } })],
  ['housingProjectId', (tx, id) => tx.housing_project.findFirst({ where: { housingProjectId: id } })],
  [
    'electrificationProjectId',
    (tx, id) => tx.electrification_project.findFirst({ where: { electrificationProjectId: id } })
  ],
  ['generalProjectId', (tx, id) => tx.general_project.findFirst({ where: { generalProjectId: id } })],
  ['noteHistoryId', (tx, id) => tx.note_history.findFirst({ where: { noteHistoryId: id } })],
  ['permitId', (tx, id) => tx.permit.findFirst({ where: { permitId: id } })]
]);

/**
 * If current scope of request is self
 * Takes the key to be read from request params
 * Obtains callback function from paramMap
 * Ensure that the current user contact is part of the activity contact list
 * @param param A route parameter string, typically a GUID
 * @returns Express middleware function
 * @throws {Problem} The error encountered upon failure
 */
export const hasAccess = (param: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await unitOfWork.executeRaw(async (tx) => {
        if (res.locals.currentAuthorization?.attributes.includes('scope:self')) {
          const id = req.params[param];
          if (Array.isArray(id)) {
            throw new TypeError('Parameter must be a string, not an array');
          }

          let data: unknown;
          if (param !== 'activityId') {
            const func = paramMap.get(param);
            if (func) data = await func(tx, id);
          }

          // @ts-expect-error Data could be one of may different types. Can this be destructured somehow?
          const activityId: string = data?.activityId ?? id;
          const contactRes = await tx.contact.findMany({ where: { userId: res.locals.currentContext.userId! } });
          const activityContacts = await tx.activity_contact.findMany({
            where: {
              activityId
            },
            include: { contact: true }
          });

          if (!activityContacts?.some((ac) => ac.contactId === contactRes[0].contactId)) {
            throw new Error();
          }
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        return next(new Problem(403, { detail: error.message, instance: req.originalUrl }));
      } else if (typeof error === 'string') {
        return next(new Problem(403, { detail: error, instance: req.originalUrl }));
      } else return next(new Problem(403, { instance: req.originalUrl }));
    }

    // Continue middleware
    next();
  };
};
