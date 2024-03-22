import { emailService } from '../services';

import type { NextFunction, Request, Response } from '../interfaces/IExpress';
import type { Email } from '../types';

const controller = {
  /**
   * @function send
   * Send an email with the roadmap data
   */
  send: async (
    req: Request<never, never, { activityId: string; emailData: Email }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { data, status } = await emailService.email(req.body.emailData);
      res.status(status).json(data);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
