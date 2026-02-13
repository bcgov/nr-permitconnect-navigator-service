import { v4 as uuidv4 } from 'uuid';

import { transactionWrapper } from '../db/utils/transactionWrapper.ts';
import { generateCreateStamps } from '../db/utils/utils.ts';
import { createPermitNote } from '../services/permitNote.ts';

import type { Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/dataConnection.ts';
import type { PermitNote } from '../types/index.ts';

export const createPermitNoteController = async (req: Request<never, never, PermitNote>, res: Response) => {
  const response = await transactionWrapper<PermitNote>(async (tx: PrismaTransactionClient) => {
    const permitNoteResponse = await createPermitNote(tx, {
      ...req.body,
      permitNoteId: uuidv4(),
      ...generateCreateStamps(req.currentContext)
    });
    return permitNoteResponse;
  });

  res.status(201).json(response);
};
