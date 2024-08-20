import { generateCreateStamps } from '../db/utils/utils';
import { comsService, emailService, noteService } from '../services';

import type { NextFunction, Request, Response } from '../interfaces/IExpress';
import type { Email, EmailAttachment } from '../types';

const controller = {
  /**
   * @function send
   * Send an email with the roadmap data
   */
  send: async (
    req: Request<never, never, { activityId: string; selectedFileIds: Array<string>; emailData: Email }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (req.body.selectedFileIds && req.body.selectedFileIds.length) {
        const attachments: Array<EmailAttachment> = [];

        if (req.currentContext?.bearerToken) {
          const comsObjects = await comsService.getObjects(req.currentContext?.bearerToken, req.body.selectedFileIds);

          // Attempt to get the requested documents from COMS
          // If succesful it is converted to base64 encoding and added to the attachment list
          const objectPromises = req.body.selectedFileIds.map(async (id) => {
            const { status, headers, data } = await comsService.getObject(
              req.currentContext?.bearerToken as string,
              id
            );

            if (status === 200) {
              const filename = comsObjects.find((x: { id: string }) => x.id === id)?.name;
              if (filename) {
                attachments.push({
                  content: Buffer.from(data).toString('base64'),
                  contentType: headers['content-type'],
                  encoding: 'base64',
                  filename: filename
                });
              } else {
                throw new Error(`Unable to obtain filename for file ${id}`);
              }
            }
          });

          await Promise.all(objectPromises);
        }

        // All succesful so attachment list is added to payload
        req.body.emailData.attachments = attachments;
      }

      // Send the email
      const { data, status } = await emailService.email(req.body.emailData);

      // Add a new note on success
      if (status === 201) {
        let noteBody = req.body.emailData.body;
        if (req.body.emailData.attachments) {
          noteBody += '\n\nAttachments:\n';
          req.body.emailData.attachments.forEach((x) => {
            noteBody += `${x.filename}\n`;
          });
        }

        await noteService.createNote({
          activityId: req.body.activityId,
          note: noteBody,
          noteType: 'Roadmap',
          title: 'Sent roadmap',
          bringForwardDate: null,
          bringForwardState: null,
          isDeleted: false,
          ...generateCreateStamps(req.currentContext)
        });
      }

      res.status(status).json(data);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
