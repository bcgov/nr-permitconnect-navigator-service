import { v4 as uuidv4 } from 'uuid';

import { transactionWrapper } from '../db/utils/transactionWrapper';
import { generateCreateStamps, generateNullDeleteStamps, generateNullUpdateStamps } from '../db/utils/utils';
import { getObject } from '../services/coms';
import { email } from '../services/email';
import { createNote } from '../services/note';
import { createNoteHistory } from '../services/noteHistory';
import { Problem } from '../utils';

import type { Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/dataConnection';
import type { Email, EmailAttachment, NoteHistory } from '../types';

/**
 * Send an email with the roadmap data
 * @param req Express Request object
 * @param res Express Response object
 */
export const sendRoadmapController = async (
  req: Request<never, never, { activityId: string; selectedFileIds: string[]; emailData: Email }>,
  res: Response
) => {
  if (req.body.selectedFileIds?.length) {
    const attachments: EmailAttachment[] = [];

    if (req.currentContext?.bearerToken) {
      // Attempt to get the requested documents from COMS
      // If succesful it is converted to base64 encoding and added to the attachment list
      const objectPromises = req.body.selectedFileIds.map(async (id) => {
        const { status, headers, data } = await getObject(req.currentContext.bearerToken!, id);

        if (status === 200) {
          const filename = headers['x-amz-meta-name'] as string;
          if (filename) {
            attachments.push({
              content: Buffer.from(data).toString('base64'),
              contentType: headers['content-type'] as string,
              encoding: 'base64',
              filename: filename
            });
          } else {
            throw new Problem(status, { detail: `Unable to obtain filename for file ${id}` });
          }
        }
      });

      await Promise.all(objectPromises);
    }

    // All succesful so attachment list is added to payload
    req.body.emailData.attachments = attachments;
  }

  // Send the email
  const { status } = await email(req.body.emailData);

  const response = await transactionWrapper<NoteHistory>(async (tx: PrismaTransactionClient) => {
    // Add a new note on successful email send
    if (status === 201) {
      let noteBody = req.body.emailData.body;
      if (req.body.emailData.attachments) {
        noteBody += '\n\nAttachments:\n';
        req.body.emailData.attachments.forEach((x) => {
          noteBody += `${x.filename}\n`;
        });
      }

      const noteHistory = await createNoteHistory(tx, {
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
        ...generateCreateStamps(req.currentContext),
        ...generateNullUpdateStamps(),
        ...generateNullDeleteStamps()
      });

      const note = await createNote(tx, {
        noteId: uuidv4(),
        noteHistoryId: noteHistory.noteHistoryId,
        note: noteBody,
        ...generateCreateStamps(req.currentContext),
        ...generateNullUpdateStamps(),
        ...generateNullDeleteStamps()
      });
      return { ...noteHistory, note: [note] };
    } else {
      throw new Problem(500, { detail: 'Failed to send roadmap email.' });
    }
  });
  res.status(201).json(response);
};
