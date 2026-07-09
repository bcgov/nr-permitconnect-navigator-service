import { listCodeTablesService } from '../services/code.ts';

import type { Request, Response } from 'express';

export const listCodeTablesController = async (_req: Request, res: Response) => {
  const response = await listCodeTablesService();
  res.status(200).json(response);
};
