import { getPeachRecord } from '../services/peach';

import type { Request, Response } from 'express';

export const getPeachRecordController = async (req: Request<{ recordId: string; systemId: string }>, res: Response) => {
  const response = await getPeachRecord(req.params.recordId, req.params.systemId);

  res.status(200).json(response);
};
