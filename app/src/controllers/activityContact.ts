import { transactionWrapper } from '../db/utils/transactionWrapper';
import { createActivityContact, deleteActivityContact, listActivityContacts } from '../services/activityContact';
import { ActivityContactRole } from '../utils/enums/projectCommon';

import type { Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/dataConnection';

export const createActivityContactController = async (
  req: Request<{ activityId: string; contactId: string }, never, { role: ActivityContactRole }>,
  res: Response
) => {
  const response = await transactionWrapper(async (tx: PrismaTransactionClient) => {
    return await createActivityContact(tx, req.params.activityId, req.params.contactId, req.body.role);
  });

  res.status(201).json(response);
};

export const deleteActivityContactController = async (
  req: Request<{ activityId: string; contactId: string }>,
  res: Response
) => {
  await transactionWrapper(async (tx: PrismaTransactionClient) => {
    await deleteActivityContact(tx, req.params.activityId, req.params.contactId);
  });

  res.status(200).end();
};

export const listActivityContactController = async (req: Request<{ activityId: string }>, res: Response) => {
  const response = await transactionWrapper(async (tx: PrismaTransactionClient) => {
    return await listActivityContacts(tx, req.params.activityId);
  });

  res.status(200).json(response);
};
