import { activityService } from '../services';

import { ACTIVITY_ID_LENGTH } from '../utils/constants/application';

import type { NextFunction, Request, Response } from '../interfaces/IExpress';

const controller = {
  validateActivityId: async (req: Request<{ activityId: string }>, res: Response, next: NextFunction) => {
    try {
      const { activityId } = req.params;
      const hexidecimal = parseInt(activityId, 16);

      if (activityId.length !== ACTIVITY_ID_LENGTH || !hexidecimal) {
        return res.status(400).json({ message: 'Invalid activity Id format' });
      }
      const activity = await activityService.getActivity(activityId);

      res.status(200).json({ valid: !!activity && !activity.isDeleted });
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
