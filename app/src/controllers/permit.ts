import {
  deletePermitService,
  getPermitService,
  intakePermitService,
  listPermitsService,
  searchPermitsService,
  upsertPermitService
} from '#src/services/permit';
import { Initiative } from '#src/utils/enums/application';
import { Problem } from '#src/utils/index';

import type { Request, Response } from 'express';
import type {
  IntakePermitRequest,
  ListPermitsRequest,
  LocalContext,
  Permit,
  SearchPermitsRequest,
  SearchPermitsResponse,
  UpsertPermitBodyRequest
} from '#types';

export const deletePermitController = async (req: Request<{ permitId: string }>, res: Response) => {
  await deletePermitService(req.params.permitId);
  res.status(204).end();
};

export const getPermitController = async (req: Request<{ permitId: string }>, res: Response) => {
  const response = await getPermitService(req.params.permitId);
  res.status(200).json(response);
};

export const intakePermitsController = async (
  req: Request<never, never, IntakePermitRequest[]>,
  res: Response<Permit[], LocalContext>
) => {
  const response = await intakePermitService(res.locals.currentAuthorization, res.locals.currentContext, req.body);
  res.status(201).json(response);
};

export const listPermitsController = async (
  req: Request<never, never, never, ListPermitsRequest>,
  res: Response<Permit[], LocalContext>
) => {
  const response = await listPermitsService(res.locals.currentAuthorization, res.locals.currentContext, req.query);
  res.status(200).json(response);
};

export const searchPermitsController = async (
  req: Request<never, never, never, SearchPermitsRequest>,
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

export const upsertPermitController = async (req: Request<never, never, UpsertPermitBodyRequest>, res: Response) => {
  const { permitTracking, permitType, permitNote, ...permit } = req.body;
  const response = await upsertPermitService(permit, permitNote, permitTracking, permitType);
  res.status(200).json(response);
};
