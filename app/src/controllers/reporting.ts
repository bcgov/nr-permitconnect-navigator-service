import { transactionWrapper } from '../db/utils/transactionWrapper.ts';
import {
  getElectrificationProjectPermitData,
  getGeneralProjectPermitData,
  getHousingProjectPermitData
} from '../services/reporting.ts';

import type { Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/dataConnection.ts';

export const getElectrificationProjectPermitDataController = async (req: Request, res: Response) => {
  const response = await transactionWrapper<unknown>(async (tx: PrismaTransactionClient) => {
    return await getElectrificationProjectPermitData(tx);
  });
  res.status(200).json(response);
};

export const getGeneralProjectPermitDataController = async (req: Request, res: Response) => {
  const response = await transactionWrapper<unknown>(async (tx: PrismaTransactionClient) => {
    return await getGeneralProjectPermitData(tx);
  });
  res.status(200).json(response);
};

export const getHousingProjectPermitDataController = async (req: Request, res: Response) => {
  const response = await transactionWrapper<unknown>(async (tx: PrismaTransactionClient) => {
    return await getHousingProjectPermitData(tx);
  });
  res.status(200).json(response);
};
