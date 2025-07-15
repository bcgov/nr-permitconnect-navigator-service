import { generateCreateStamps, generateUpdateStamps } from '../db/utils/utils';
import { createPermit, deletePermit, getPermit, listPermits, listPermitTypes, updatePermit } from '../services/permit';
import { Initiative } from '../utils/enums/application';
import { isTruthy } from '../utils/utils';

import type { Request, Response } from 'express';
import type { ListPermitsOptions, Permit, PermitType } from '../types';

export const createPermitController = async (req: Request<never, never, Permit>, res: Response) => {
  const response: Permit = await createPermit({
    ...req.body,
    ...generateCreateStamps(req.currentContext),
    ...generateUpdateStamps(req.currentContext)
  });
  res.status(201).json(response);
};

export const deletePermitController = async (req: Request<{ permitId: string }>, res: Response) => {
  const response: Permit = await deletePermit(req.params.permitId);
  res.status(200).json(response);
};

export const getPermitController = async (req: Request<{ permitId: string }>, res: Response) => {
  const response: Permit = await getPermit(req.params.permitId);
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

export const listPermitTypesController = async (
  req: Request<never, never, never, { initiative: Initiative }>,
  res: Response
) => {
  const response: PermitType[] = await listPermitTypes(req.query.initiative);
  res.status(200).json(response);
};

export const updatePermitController = async (req: Request<never, never, Permit>, res: Response) => {
  const response: Permit = await updatePermit({
    ...req.body,
    ...generateUpdateStamps(req.currentContext)
  });
  res.status(200).json(response);
};
