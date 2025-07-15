import { getHousingProject } from '../services/housingProject';
import { getPIDs } from '../services/map';

import type { Request, Response } from 'express';

export const getPIDsController = async (req: Request<{ housingProjectId: string }>, res: Response) => {
  const housingProject = await getHousingProject(req.params.housingProjectId);

  let response;
  if (housingProject?.geoJson) response = await getPIDs(housingProject.geoJson);

  res.status(200).json(response);
};
