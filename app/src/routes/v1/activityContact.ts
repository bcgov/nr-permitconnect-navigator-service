import express from 'express';

import {
  createActivityContactController,
  deleteActivityContactController,
  listActivityContactController
} from '../../controllers/activityContact';
import { transactionWrapper } from '../../db/utils/transactionWrapper';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { listActivityContacts } from '../../services/activityContact';
import { searchContacts } from '../../services/contact';
import { activityContactValidator } from '../../validators';
import { Problem } from '../../utils';
import { ActivityContactRole } from '../../utils/enums/projectCommon';

import type { NextFunction, Request, Response } from 'express';
import type { PrismaTransactionClient } from '../../db/dataConnection';

/**
 * Verify requesting user has elevated priviledges on the requested activity
 * Rejects the request if user lacks permission
 * @param req Express request object
 * @param res Express response object
 * @param next The next callback function
 * @returns Express middleware function
 * @throws The error encountered upon failure
 */
const requireActivityAdmin = async (
  req: Request<{ activityId: string; contactId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    await transactionWrapper<void>(async (tx: PrismaTransactionClient) => {
      const contact = await searchContacts(tx, { userId: [req.currentContext.userId as string] });
      const activityContacts = await listActivityContacts(tx, req.params.activityId);
      const activityContact = activityContacts.find((ac) => ac.contactId === contact[0].contactId);
      if (
        activityContact &&
        ![ActivityContactRole.PRIMARY, ActivityContactRole.ADMIN].includes(activityContact.role as ActivityContactRole)
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

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

/** List activity_contact linkages for an activity */
router.get(
  '/:activityId/contact',
  requireActivityAdmin,
  activityContactValidator.listActivityContact,
  listActivityContactController
);

/** Create an activity_contact linkage for an activity */
router.post(
  '/:activityId/contact/:contactId',
  requireActivityAdmin,
  activityContactValidator.createActivityContact,
  createActivityContactController
);

/** Delete an activity_contact linkage for an activity */
router.delete(
  '/:activityId/contact/:contactId',
  requireActivityAdmin,
  activityContactValidator.deleteActivityContact,
  deleteActivityContactController
);

export default router;
