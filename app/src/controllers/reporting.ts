import config from 'config';
import jwt from 'jsonwebtoken';

import {
  getElectrificationProjectPermitDataService,
  getGeneralProjectPermitDataService,
  getHousingProjectPermitDataService
} from '#src/services/reporting';

import type { Request, Response } from 'express';

export const getDashboardController = (_req: Request, res: Response) => {
  // Metabase is only configured in prod
  if (!['dashboardId', 'secretKey', 'siteUrl'].every((key) => config.has(`server.metabase.${key}`))) {
    res.status(200).json({ url: null });
    return;
  }

  const token = jwt.sign(
    { resource: { dashboard: Number(config.get('server.metabase.dashboardId')) }, params: {} },
    config.get<string>('server.metabase.secretKey'),
    { expiresIn: '1h' }
  );
  res.status(200).json({
    url: `${config.get('server.metabase.siteUrl')}/embed/dashboard/${token}#bordered=false&titled=false`
  });
};

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
