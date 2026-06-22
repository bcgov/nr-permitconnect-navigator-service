import { transactionWrapper } from '../db/utils/transactionWrapper.ts';
import { listActivityContacts } from '../services/activityContact.ts';
import { searchContacts } from '../services/contact.ts';
import { subjectHasInitiativeGroupName } from '../services/yars.ts';
import { Problem } from '../utils/index.ts';
import { GroupName } from '../utils/enums/application.ts';
import { ActivityContactRole } from '../utils/enums/projectCommon.ts';

import type { NextFunction, Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/database.ts';

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
  res: Response,
  next: NextFunction
) => {
  try {
    // Skip if user has scope:all
    if (res.locals.currentAuthorization.attributes.includes('scope:all')) return next();

    await transactionWrapper<void>(async (tx: PrismaTransactionClient) => {
      let isActivityAdmin = false;
      let isGroupAdmin = false;

      // Navigator group check
      if (res.locals.currentContext.tokenPayload?.sub)
        isGroupAdmin = await subjectHasInitiativeGroupName(
          tx,
          res.locals.currentContext.tokenPayload?.sub,
          res.locals.currentContext.initiative,
          [GroupName.SUPERVISOR, GroupName.NAVIGATOR]
        );

      if (!isGroupAdmin) {
        // Proponent team member role check
        const contact = await searchContacts(tx, { userId: [res.locals.currentContext.userId as string] });
        const activityContacts = await listActivityContacts(tx, [req.params.activityId]);
        const activityContact = activityContacts.find((ac) => ac.contactId === contact[0].contactId);

        isActivityAdmin =
          !!activityContact &&
          [ActivityContactRole.PRIMARY, ActivityContactRole.ADMIN].includes(
            activityContact.role as ActivityContactRole
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
