import {
  deletePermitService,
  getPermitService,
  listPermitsService,
  searchPermitsService,
  upsertPermitService
} from '../services/permit.ts';
import { Initiative } from '../utils/enums/application.ts';
import { Problem } from '../utils/index.ts';
import { isTruthy } from '../utils/utils.ts';

import type { Request, Response } from 'express';
import type {
  ListPermitsOptions,
  LocalContext,
  Permit,
  SearchPermitsOptions,
  SearchPermitsResponse
} from '../types/index.ts';

export const deletePermitController = async (req: Request<{ permitId: string }>, res: Response) => {
  await deletePermitService(req.params.permitId);
  res.status(204).end();
};

export const getPermitController = async (req: Request<{ permitId: string }>, res: Response) => {
  const response = await getPermitService(req.params.permitId);
  res.status(200).json(response);
};

export const listPermitsController = async (
  req: Request<never, never, never, Partial<ListPermitsOptions>>,
  res: Response<Permit[], LocalContext>
) => {
  const options: ListPermitsOptions = {
    ...req.query,
    includeNotes: isTruthy(req.query.includeNotes)
  };

  const response = await listPermitsService(res.locals.currentAuthorization, res.locals.currentContext, options);
  res.status(200).json(response);
};

export const searchPermitsController = async (
  req: Request<never, never, never, SearchPermitsOptions>,
  res: Response<SearchPermitsResponse, LocalContext>
) => {
  // Validate it's not PCNS
  if (res.locals.currentContext.initiative === Initiative.PCNS) {
    throw new Problem(400, { detail: 'Invalid initiative' });
  }

  const response = await searchPermitsService(
    res.locals.currentAuthorization,
    res.locals.currentContext,
    res.locals.currentContext.initiative,
    req.query
  );
  res.status(200).json(response);
};

export const upsertPermitController = async (req: Request<never, never, Permit>, res: Response) => {
  const { permitTracking, permitType, permitNote, ...permit } = req.body;
  const response = await upsertPermitService(permit, permitNote, permitTracking, permitType);
  res.status(200).json(response);
};
