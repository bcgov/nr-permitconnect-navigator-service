import { listPermitTypesService } from '../services/permitType.ts';
import { Initiative } from '../utils/enums/application.ts';

import type { Request, Response } from 'express';

export const listPermitTypesController = async (
  req: Request<never, never, never, { initiative?: Initiative }>,
  res: Response
) => {
  const response = await listPermitTypesService(req.query.initiative);
  res.status(200).json(response);
};
