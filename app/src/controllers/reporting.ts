import type { Request, Response } from 'express';
import { getElectrificationProjectPermitData, getHousingProjectPermitData } from '../services/reporting';

export const getElectrificationProjectPermitDataController = async (req: Request, res: Response) => {
  const response = await getElectrificationProjectPermitData();
  res.status(200).json(response);
};

export const getHousingProjectPermitDataController = async (req: Request, res: Response) => {
  const response = await getHousingProjectPermitData();
  res.status(200).json(response);
};
