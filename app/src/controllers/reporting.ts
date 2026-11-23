import config from 'config';
import jwt from 'jsonwebtoken';

import {
  getElectrificationProjectPermitDataService,
  getGeneralProjectPermitDataService,
  getHousingProjectPermitDataService
} from '#src/services/reporting';

import type { Request, Response } from 'express';
import type { Initiative } from '#src/utils/enums/application';

export const getDashboardController = (
  req: Request<never, never, never, { initiative: Initiative }>,
  res: Response
) => {
  // Metabase is only configured in prod, and not every initiative has a dashboard
  const dashboardKey = `server.metabase.dashboards.${req.query.initiative}`;
  if (![dashboardKey, 'server.metabase.secretKey', 'server.metabase.siteUrl'].every((key) => config.has(key))) {
    res.status(200).json({ url: null });
    return;
  }

  const token = jwt.sign(
    { resource: { dashboard: Number(config.get(dashboardKey)) }, params: {} },
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
