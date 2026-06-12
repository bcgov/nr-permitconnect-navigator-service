import { transactionWrapper } from '../db/utils/transactionWrapper.ts';

import { listPermitTypes } from '../services/permitType';
import { Initiative } from '../utils/enums/application.ts';

import type { Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/database.ts';
import type { PermitType } from '../types/models.ts';

export const listPermitTypesController = async (
  req: Request<never, never, never, { initiative?: Initiative }>,
  res: Response
) => {
  const response = await transactionWrapper<PermitType[]>(async (tx: PrismaTransactionClient) => {
    return await listPermitTypes(tx, req.query.initiative);
  });
  res.status(200).json(response);
};
