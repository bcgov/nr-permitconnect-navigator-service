import { transactionWrapper } from '../db/utils/transactionWrapper.ts';
import { listActivityContacts } from '../services/activityContact.ts';
import { searchContacts } from '../services/contact.ts';
import { Problem } from '../utils/index.ts';
import { ActivityContactRole } from '../utils/enums/projectCommon.ts';

import type { NextFunction, Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/dataConnection.ts';

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
