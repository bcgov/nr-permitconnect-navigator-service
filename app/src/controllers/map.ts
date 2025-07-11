import { housingProjectService, mapService } from '../services';

import type { NextFunction, Request, Response } from 'express';

const controller = {
  getPIDs: async (req: Request<{ housingProjectId: string }>, res: Response, next: NextFunction) => {
    try {
      const housingProject = await housingProjectService.getHousingProject(req.params.housingProjectId);

      let response;
      if (housingProject?.geoJson) response = await mapService.getPIDs(housingProject.geoJson);

      res.status(200).json(response);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
