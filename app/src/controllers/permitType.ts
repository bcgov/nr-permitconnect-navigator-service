import { listPermitTypesService } from '../services/permitType.ts';

import type { Request, Response } from 'express';
import type { Initiative } from '../utils/enums/application.ts';

export const listPermitTypesController = async (
  req: Request<never, never, never, { initiative?: Initiative }>,
  res: Response
) => {
  const response = await listPermitTypesService(req.query.initiative);
  res.status(200).json(response);
};
