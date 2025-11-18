import prisma from '../db/dataConnection';
import { searchContacts } from '../services/contact';
import { Problem } from '../utils';

import type { NextFunction, Request, Response } from 'express';
import type { Activity } from '../types';

/**
 * Filters the response json based on the scope of the current authorization
 * Filtering is based on the current authorizations `contactId` compared against the outgoing
 * `activityContact` data
 * @param req Express request object
 * @param res Express response object
 * @param next The next callback function
 * @returns Express middleware function
 * @throws The error encountered upon failure
 */
export const filterActivityResponseByScope = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Store the original res.json function
    const originalJson = res.json;

    const contact = await searchContacts(prisma, { userId: [req.currentContext.userId as string] });

    // Override res.json to intercept the response data
    type unknownType = unknown & { activity?: Activity };
    res.json = function (data: unknownType | unknownType[]) {
      let filtered = data;

      // Check scope and filter as necessary
      if (req.currentAuthorization?.attributes.includes('scope:self')) {
        if (Array.isArray(data)) {
          filtered = data.filter((x: unknown & { activity?: Activity }) =>
            x.activity?.activityContact?.some((ac) => ac.contactId === contact[0].contactId)
          );
        } else {
          if (!data.activity?.activityContact?.some((ac) => ac.contactId === contact[0].contactId)) filtered = {};
        }
      }

      return originalJson.call(this, filtered);
    };

    next();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return next(new Problem(403, { detail: err.message, instance: req.originalUrl }));
  }
};
