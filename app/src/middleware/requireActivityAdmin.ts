import { transactionWrapper } from '../db/utils/transactionWrapper';
import { listActivityContacts } from '../services/activityContact';
import { searchContacts } from '../services/contact';
import { Problem } from '../utils';
import { ActivityContactRole } from '../utils/enums/projectCommon';

import type { NextFunction, Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/dataConnection';

/**
 * Verify requesting user has elevated priviledges on the requested activity
 * Rejects the request if user lacks permission
 * @param req Express request object
 * @param res Express response object
 * @param next The next callback function
 * @returns Express middleware function
 * @throws The error encountered upon failure
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
      const contact = await searchContacts(tx, { userId: [req.currentContext.userId as string] });
      const activityContacts = await listActivityContacts(tx, req.params.activityId);
      const activityContact = activityContacts.find((ac) => ac.contactId === contact[0].contactId);
      if (
        !activityContact ||
        (activityContact &&
          ![ActivityContactRole.PRIMARY, ActivityContactRole.ADMIN].includes(
            activityContact.role as ActivityContactRole
          ))
      ) {
        throw new Error();
      }
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return next(new Problem(403, { detail: err.message, instance: req.originalUrl }));
  }

  // Continue middleware
  next();
};
