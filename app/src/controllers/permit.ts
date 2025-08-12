import { v4 as uuidv4 } from 'uuid';

import { generateUpdateStamps } from '../db/utils/utils';
import { isTruthy } from '../utils/utils';
import { Initiative } from '../utils/enums/application';
import { deletePermit, getPermit, getPermitTypes, listPermits, upsertPermit } from '../services/permit';
import { upsertPermitTracking } from '../services/permitTracking';

import type { Request, Response } from 'express';
import type { ListPermitsOptions, Permit, PermitType } from '../types';

export const deletePermitController = async (req: Request<{ permitId: string }>, res: Response) => {
  const response: Permit = await deletePermit(req.params.permitId);
  res.status(200).json(response);
};

export const getPermitController = async (req: Request<{ permitId: string }>, res: Response) => {
  const response: Permit = await getPermit(req.params.permitId);
  res.status(200).json(response);
};

export const getPermitTypesController = async (
  req: Request<never, never, never, { initiative: Initiative }>,
  res: Response
) => {
  const response: PermitType[] = await getPermitTypes(req.query.initiative);
  res.status(200).json(response);
};

export const listPermitsController = async (
  req: Request<never, never, never, Partial<ListPermitsOptions>>,
  res: Response
) => {
  const options: ListPermitsOptions = {
    ...req.query,
    includeNotes: isTruthy(req.query.includeNotes)
  };

  const response: Permit[] = await listPermits(options);
  res.status(200).json(response);
};

export const upsertPermitController = async (req: Request<never, never, Permit>, res: Response) => {
  const permitDataWithId = {
    ...req.body,
    ...generateUpdateStamps(req.currentContext),
    permitId: req.body.permitId || uuidv4()
  };

  const response: Permit = await upsertPermit(permitDataWithId);
  await upsertPermitTracking(permitDataWithId);
  res.status(200).json(response);
};
