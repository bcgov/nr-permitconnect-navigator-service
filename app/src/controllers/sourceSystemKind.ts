import { transactionWrapper } from '../db/utils/transactionWrapper.ts';
import { getSourceSystemKinds } from '../services/sourceSystemKind.ts';

import type { Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/dataConnection.ts';
import type { SourceSystemKind } from '../types/index.ts';

export const getSourceSystemKindsController = async (req: Request, res: Response) => {
  const response = await transactionWrapper<SourceSystemKind[]>(async (tx: PrismaTransactionClient) => {
    return await getSourceSystemKinds(tx);
  });
  res.status(200).json(response);
};
