import { listPermitTypesService } from '#src/services/permitType';

import type { Request, Response } from 'express';
import type { Initiative } from '#src/utils/enums/application';

export const listPermitTypesController = async (
  req: Request<never, never, never, { initiative?: Initiative }>,
  res: Response
) => {
  const response = await listPermitTypesService(req.query.initiative);
  res.status(200).json(response);
};
