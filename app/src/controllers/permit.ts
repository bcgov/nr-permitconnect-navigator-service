import { v4 as uuidv4 } from 'uuid';

import { transactionWrapper } from '../db/utils/transactionWrapper';
import { PrismaTransactionClient } from '../db/dataConnection';
import { generateUpdateStamps } from '../db/utils/utils';
import { isTruthy } from '../utils/utils';
import { Initiative } from '../utils/enums/application';
import { deletePermit, getPermit, getPermitTypes, listPermits, upsertPermit } from '../services/permit';
import { upsertPermitTracking } from '../services/permitTracking';

import type { Request, Response } from 'express';
import type { ListPermitsOptions, Permit, PermitType } from '../types';

export const deletePermitController = async (req: Request<{ permitId: string }>, res: Response) => {
  await transactionWrapper<void>(async (tx: PrismaTransactionClient) => {
    await deletePermit(tx, req.params.permitId);
  });
  res.status(204).end();
};

export const getPermitController = async (req: Request<{ permitId: string }>, res: Response) => {
  const response = await transactionWrapper<Permit>(async (tx: PrismaTransactionClient) => {
    return await getPermit(tx, req.params.permitId);
  });
  res.status(200).json(response);
};

export const getPermitTypesController = async (
  req: Request<never, never, never, { initiative: Initiative }>,
  res: Response
) => {
  const response = await transactionWrapper<PermitType[]>(async (tx: PrismaTransactionClient) => {
    return await getPermitTypes(tx, req.query.initiative);
  });
  res.status(200).json(response);
};

export const listPermitsController = async (
  req: Request<never, never, never, Partial<ListPermitsOptions>>,
  res: Response
) => {
  const response = await transactionWrapper<Permit[]>(async (tx: PrismaTransactionClient) => {
    const options: ListPermitsOptions = {
      ...req.query,
      includeNotes: isTruthy(req.query.includeNotes)
    };

    return await listPermits(tx, options);
  });
  res.status(200).json(response);
};

export const upsertPermitController = async (req: Request<never, never, Permit>, res: Response) => {
  const response = await transactionWrapper<Permit>(async (tx: PrismaTransactionClient) => {
    const permitDataWithId = {
      ...req.body,
      ...generateUpdateStamps(req.currentContext),
      permitId: req.body.permitId || uuidv4()
    };

    const data = await upsertPermit(tx, permitDataWithId);
    await upsertPermitTracking(tx, permitDataWithId);
    return data;
  });
  res.status(200).json(response);
};
