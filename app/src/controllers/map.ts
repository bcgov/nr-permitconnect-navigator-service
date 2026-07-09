import { getPidsService } from '../services/map.ts';

import type { Request, Response } from 'express';

export const getPidsController = async (req: Request<{ projectId: string }>, res: Response) => {
  const response = await getPidsService(req.params.projectId);
  res.status(response ? 200 : 204).json(response);
};
