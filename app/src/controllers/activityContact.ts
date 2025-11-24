import { Problem } from '../utils';
import { transactionWrapper } from '../db/utils/transactionWrapper';
import {
  createActivityContact,
  deleteActivityContact,
  getActivityContact,
  listActivityContacts,
  updateActivityContact
} from '../services/activityContact';
import { ActivityContactRole } from '../utils/enums/projectCommon';

import type { Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/dataConnection';
import type { ActivityContact } from '../types';

export const createActivityContactController = async (
  req: Request<{ activityId: string; contactId: string }, never, { role: ActivityContactRole }>,
  res: Response
) => {
  const response = await transactionWrapper<ActivityContact>(async (tx: PrismaTransactionClient) => {
    return await createActivityContact(tx, req.params.activityId, req.params.contactId, req.body.role);
  });

  res.status(201).json(response);
};

export const deleteActivityContactController = async (
  req: Request<{ activityId: string; contactId: string }>,
  res: Response
) => {
  await transactionWrapper<void>(async (tx: PrismaTransactionClient) => {
    const ac = await getActivityContact(tx, req.params.activityId, req.params.contactId);
    if (ac.role === ActivityContactRole.PRIMARY) throw new Problem(403, { detail: 'Cannot remove PRIMARY contact' });
    await deleteActivityContact(tx, req.params.activityId, req.params.contactId);
  });

  res.status(204).end();
};

export const listActivityContactController = async (req: Request<{ activityId: string }>, res: Response) => {
  const response = await transactionWrapper<ActivityContact[]>(async (tx: PrismaTransactionClient) => {
    return await listActivityContacts(tx, req.params.activityId);
  });

  res.status(200).json(response);
};

export const updateActivityContactController = async (
  req: Request<{ activityId: string; contactId: string }, never, { role: ActivityContactRole }>,
  res: Response
) => {
  const response = await transactionWrapper<ActivityContact>(async (tx: PrismaTransactionClient) => {
    const ac = await getActivityContact(tx, req.params.activityId, req.params.contactId);
    if (ac.role === ActivityContactRole.PRIMARY) throw new Problem(403, { detail: 'Cannot remove PRIMARY contact' });
    return await updateActivityContact(tx, req.params.activityId, req.params.contactId, req.body.role);
  });

  res.status(200).json(response);
};
