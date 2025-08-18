import { v4 as uuidv4 } from 'uuid';

import { PrismaTransactionClient } from '../db/dataConnection';
import { transactionWrapper } from '../db/utils/transactionWrapper';
import { generateCreateStamps, generateNullUpdateStamps } from '../db/utils/utils';
import { getObject, getObjects } from '../services/coms';
import { email } from '../services/email';
import { createNote } from '../services/note';
import { createNoteHistory } from '../services/noteHistory';

import type { Request, Response } from 'express';
import type { Email, EmailAttachment } from '../types';

/**
 * @function send
 * Send an email with the roadmap data
 */
export const sendRoadmapController = async (
  req: Request<never, never, { activityId: string; selectedFileIds: string[]; emailData: Email }>,
  res: Response
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await transactionWrapper<{ data: any; status: number }>(async (tx: PrismaTransactionClient) => {
    if (req.body.selectedFileIds && req.body.selectedFileIds.length) {
      const attachments: EmailAttachment[] = [];

        if (req.currentContext?.bearerToken) {
          // Attempt to get the requested documents from COMS
          // If succesful it is converted to base64 encoding and added to the attachment list
          const objectPromises = req.body.selectedFileIds.map(async (id) => {
            const { status, headers, data } = await comsService.getObject(
              req.currentContext?.bearerToken as string,
              id
            );

            if (status === 200) {
              const filename = headers['x-amz-meta-name'];
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
      });

        await Promise.all(objectPromises);
      }

      // All succesful so attachment list is added to payload
      req.body.emailData.attachments = attachments;
    }

    // Send the email
    const { data, status } = await email(req.body.emailData);

    // Add a new note on success
    if (status === 201) {
      let noteBody = req.body.emailData.body;
      if (req.body.emailData.attachments) {
        noteBody += '\n\nAttachments:\n';
        req.body.emailData.attachments.forEach((x) => {
          noteBody += `${x.filename}\n`;
        });
      }

      const history = await createNoteHistory(tx, {
        noteHistoryId: uuidv4(),
        activityId: req.body.activityId,
        type: 'Roadmap',
        title: 'Sent roadmap',
        bringForwardDate: null,
        bringForwardState: null,
        escalateToSupervisor: false,
        escalateToDirector: false,
        escalationType: null,
        shownToProponent: false,
        isDeleted: false,
        ...generateCreateStamps(req.currentContext),
        ...generateNullUpdateStamps()
      });

      await createNote(tx, {
        noteId: uuidv4(),
        noteHistoryId: history.noteHistoryId,
        note: noteBody,
        ...generateCreateStamps(req.currentContext),
        ...generateNullUpdateStamps()
      });
    }

    return { data, status };
  });

  res.status(response.status).json(response.data);
};
