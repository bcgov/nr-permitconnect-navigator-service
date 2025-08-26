import { transactionWrapper } from '../db/utils/transactionWrapper';
import { getSourceSystemKinds } from '../services/sourceSystemKind';

import type { Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/dataConnection';
import type { SourceSystemKind } from '../types';

export const getSourceSystemKindsController = async (req: Request, res: Response) => {
  const response = await transactionWrapper<SourceSystemKind[]>(async (tx: PrismaTransactionClient) => {
    return await getSourceSystemKinds(tx);
  });
  res.status(200).json(response);
};
