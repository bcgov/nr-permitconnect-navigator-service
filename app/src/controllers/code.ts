import { listAllCodeTables } from '../services/code';

import type { Request, Response } from 'express';

export const listAllCodeTablesController = async (req: Request, res: Response) => {
  const response = await listAllCodeTables();
  res.status(200).json(response);
};
