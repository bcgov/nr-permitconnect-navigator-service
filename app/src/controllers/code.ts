import { transactionWrapper } from '../db/utils/transactionWrapper.ts';
import { listAllCodeTables } from '../services/code.ts';

import type { Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/dataConnection.ts';

export const listAllCodeTablesController = async (req: Request, res: Response) => {
  const response = await transactionWrapper(async (tx: PrismaTransactionClient) => {
    return await listAllCodeTables(tx);
  });
  res.status(200).json(response);
};
