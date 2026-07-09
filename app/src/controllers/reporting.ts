import {
  getElectrificationProjectPermitDataService,
  getGeneralProjectPermitDataService,
  getHousingProjectPermitDataService
} from '../services/reporting.ts';

import type { Request, Response } from 'express';

export const getElectrificationProjectPermitDataController = async (req: Request, res: Response) => {
  const response = await getElectrificationProjectPermitDataService();
  res.status(200).json(response);
};

export const getGeneralProjectPermitDataController = async (req: Request, res: Response) => {
  const response = await getGeneralProjectPermitDataService();
  res.status(200).json(response);
};

export const getHousingProjectPermitDataController = async (req: Request, res: Response) => {
  const response = await getHousingProjectPermitDataService();
  res.status(200).json(response);
};
