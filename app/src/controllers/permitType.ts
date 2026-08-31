import { listPermitTypesService } from '#src/services/permitType';

import type { Request, Response } from 'express';
import type { ListPermitTypesRequest } from '#types';
import type { Initiative } from '#src/utils/enums/application';

export const listPermitTypesController = async (
  req: Request<never, never, never, ListPermitTypesRequest>,
  res: Response
) => {
  const response = await listPermitTypesService(req.query.initiative as Initiative | undefined);
  res.status(200).json(response);
};
