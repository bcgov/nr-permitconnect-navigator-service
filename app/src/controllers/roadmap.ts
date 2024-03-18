import type { NextFunction, Request, Response } from '../interfaces/IExpress';
import { emailService } from '../services';

import type { Email } from '../types';

const controller = {
  /**
   * @function update
   * update roadmap
   */
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // do other stuff related to roadmap items
      // eg: update note where id = req.body.activityId;

      const body = req.body as { activityId: string; emailData: Email };
      // send email
      const { data, status } = await emailService.email(body.emailData);
      res.status(status).json(data);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
