import { transactionWrapper } from '../db/utils/transactionWrapper.ts';
import { listActivityContacts } from '../services/activityContact.ts';
import { searchContacts } from '../services/contact.ts';
import { getSubjectGroups } from '../services/yars.ts';
import { Problem } from '../utils/index.ts';
import { GroupName } from '../utils/enums/application.ts';
import { ActivityContactRole } from '../utils/enums/projectCommon.ts';

import type { NextFunction, Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/dataConnection.ts';
import type { Group } from '../types/stuff';

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
    if (req.currentAuthorization.attributes.includes('scope:all')) return next();

    await transactionWrapper<void>(async (tx: PrismaTransactionClient) => {
      let groups: Group[] = [];

      // Proponent team member role check
      const contact = await searchContacts(tx, { userId: [req.currentContext.userId as string] });
      const activityContacts = await listActivityContacts(tx, req.params.activityId);
      const activityContact = activityContacts.find((ac) => ac.contactId === contact[0].contactId);

      const isActivityAdmin =
        activityContact &&
        [ActivityContactRole.PRIMARY, ActivityContactRole.ADMIN].includes(activityContact.role as ActivityContactRole);

      // Navigator group check
      if (req.currentContext.tokenPayload?.sub)
        groups = await getSubjectGroups(tx, req.currentContext.tokenPayload?.sub);
      const adminGroups: GroupName[] = [GroupName.SUPERVISOR, GroupName.NAVIGATOR];
      const isGroupAdmin = groups.some((x) => adminGroups.some((g) => g === x.name));

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
