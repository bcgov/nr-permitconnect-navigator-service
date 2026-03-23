import { transactionWrapper } from '../db/utils/transactionWrapper.ts';
import { getPIDs } from '../services/map.ts';
import { getProjectByProjectId } from '../services/project.ts';

import type { Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/dataConnection.ts';

export const getPIDsController = async (req: Request<{ projectId: string }>, res: Response) => {
  const response = await transactionWrapper<string | void>(async (tx: PrismaTransactionClient) => {
    const project = await getProjectByProjectId(tx, req.params.projectId);
    if (project && 'geoJson' in project && project.geoJson) return await getPIDs(project.geoJson);
  });

  res.status(response ? 200 : 204).json(response);
};
