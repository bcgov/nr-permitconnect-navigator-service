import { PrismaTransactionClient } from '../db/dataConnection';
import { transactionWrapper } from '../db/utils/transactionWrapper';
import { listAllCodeTables } from '../services/code';

import type { Request, Response } from 'express';

export const listAllCodeTablesController = async (req: Request, res: Response) => {
  const response = await transactionWrapper(async (tx: PrismaTransactionClient) => {
    return await listAllCodeTables(tx);
  });
  res.status(200).json(response);
};
