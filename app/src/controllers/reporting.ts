import { PrismaTransactionClient } from '../db/dataConnection';
import { transactionWrapper } from '../db/utils/transactionWrapper';
import { getElectrificationProjectPermitData, getHousingProjectPermitData } from '../services/reporting';

import type { Request, Response } from 'express';

export const getElectrificationProjectPermitDataController = async (req: Request, res: Response) => {
  const response = await transactionWrapper<unknown>(async (tx: PrismaTransactionClient) => {
    return await getElectrificationProjectPermitData(tx);
  });
  res.status(200).json(response);
};

export const getHousingProjectPermitDataController = async (req: Request, res: Response) => {
  const response = await transactionWrapper<unknown>(async (tx: PrismaTransactionClient) => {
    return await getHousingProjectPermitData(tx);
  });
  res.status(200).json(response);
};
