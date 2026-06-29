import { unitOfWork } from '../repository/unitOfWork.ts';
import { Problem } from '../utils/index.ts';
import { GroupName } from '../utils/enums/application.ts';
import { ActivityContactRole } from '../utils/enums/projectCommon.ts';

import type { NextFunction, Request, Response } from 'express';
import type { LocalContext } from '../types/stuff';

/**
 * Verify requesting user has elevated priviledges on the requested activity
 * Rejects the request if user lacks permission
 * @param req Express request object
 * @param res Express response object
 * @param next The next callback function
 * @returns Express middleware function
 * @throws {Problem} The error encountered upon failure
 */
export const requireActivityAdmin = async (
  req: Request<{ activityId: string; contactId: string }>,
  res: Response<unknown, LocalContext>,
  next: NextFunction
) => {
  try {
    // Skip if user has scope:all
    if (res.locals.currentAuthorization.attributes.includes('scope:all')) return next();

    await unitOfWork.execute(async ({ activityContact, contact, subjectGroup }) => {
      let isActivityAdmin = false;
      let isGroupAdmin = false;

      // Navigator group check
      if (res.locals.currentContext.tokenPayload?.sub)
        isGroupAdmin = await subjectGroup.subjectHasInitiativeGroupName(
          res.locals.currentContext.tokenPayload?.sub,
          res.locals.currentContext.initiative,
          [GroupName.SUPERVISOR, GroupName.NAVIGATOR]
        );

      if (!isGroupAdmin) {
        // Proponent team member role check
        const contactRes = await contact.search({ userId: [res.locals.currentContext.userId as string] });
        const activityContactsRes = await activityContact.findMany({
          where: {
            activityId: req.params.activityId
          },
          include: { contact: true }
        });
        const activityContactRes = activityContactsRes.find((ac) => ac.contactId === contactRes[0].contactId);

        isActivityAdmin =
          !!activityContactRes &&
          [ActivityContactRole.PRIMARY, ActivityContactRole.ADMIN].includes(
            activityContactRes.role as ActivityContactRole
          );
      }

      if (!isActivityAdmin && !isGroupAdmin) {
        throw new Error('User lacks required role.');
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
