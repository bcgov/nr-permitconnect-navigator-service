import { transactionWrapper } from '../db/utils/transactionWrapper';
import { getHousingProject } from '../services/housingProject';
import { getPIDs } from '../services/map';

import type { Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/dataConnection';

export const getPIDsController = async (req: Request<{ projectId: string }>, res: Response) => {
  const response = await transactionWrapper<string | void>(async (tx: PrismaTransactionClient) => {
    const project = await getHousingProject(tx, req.params.projectId);
    if (project.geoJson) return await getPIDs(project.geoJson);
  });

  res.status(response ? 200 : 204).json(response);
};
