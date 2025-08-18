import { v4 as uuidv4 } from 'uuid';

import { PrismaTransactionClient } from '../db/dataConnection';
import { transactionWrapper } from '../db/utils/transactionWrapper';
import { generateCreateStamps } from '../db/utils/utils';
import { createPermitNote } from '../services/permitNote';

import type { Request, Response } from 'express';
import type { PermitNote } from '../types';

export const createPermitNoteController = async (req: Request<never, never, PermitNote>, res: Response) => {
  const response = await transactionWrapper<PermitNote>(async (tx: PrismaTransactionClient) => {
    return await createPermitNote(tx, {
      ...req.body,
      permitNoteId: uuidv4(),
      ...generateCreateStamps(req.currentContext)
    });
  });
  res.status(201).json(response);
};
