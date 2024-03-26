import { comsService, emailService } from '../services';

import type { NextFunction, Request, Response } from '../interfaces/IExpress';
import type { Email, EmailAttachment } from '../types';

const controller = {
  /**
   * @function send
   * Send an email with the roadmap data
   */
  send: async (
    req: Request<
      never,
      never,
      { activityId: string; attachmentIds: Array<{ filename: string; documentId: string }>; emailData: Email }
    >,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (req.body.attachmentIds) {
        const attachments: Array<EmailAttachment> = [];

        // Attempt to get the requested documents from COMS
        // If succesful it is converted to base64 encoding and added to the attachment list
        const uploadPromises = req.body.attachmentIds.map(async (x) => {
          const { status, headers, data } = await comsService.getObject(req.headers, x.documentId);

          if (status === 200) {
            attachments.push({
              content: Buffer.from(data).toString('base64'),
              contentType: headers['content-type'],
              encoding: 'base64',
              filename: x.filename
            });
          }
        });

        await Promise.all(uploadPromises);

        // All succesful so attachment list is added to payload
        req.body.emailData.attachments = attachments;
      }

      // Send the email
      const { data, status } = await emailService.email(req.body.emailData);
      res.status(status).json(data);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
