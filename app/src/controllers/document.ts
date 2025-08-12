import { generateCreateStamps } from '../db/utils/utils';
import { createDocument, deleteDocument, listDocuments } from '../services/document';
import { readUser } from '../services/user';

import type { Request, Response } from 'express';
import type { Document } from '../types';

export const createDocumentController = async (
  req: Request<
    never,
    never,
    { documentId: string; activityId: string; filename: string; mimeType: string; length: number }
  >,
  res: Response
) => {
  const response: Document & { createdByFullName?: string } = await createDocument(
    req.body.documentId,
    req.body.activityId,
    req.body.filename,
    req.body.mimeType,
    req.body.length,
    generateCreateStamps(req.currentContext)
  );

  if (response.createdBy) {
    const user = await readUser(response.createdBy);
    response.createdByFullName = user ? `${user.fullName}` : '';
  }

  res.status(201).json(response);
};

export const deleteDocumentController = async (req: Request<{ documentId: string }>, res: Response) => {
  const response = await deleteDocument(req.params.documentId);
  res.status(200).json(response);
};

export const listDocumentsController = async (req: Request<{ activityId: string }>, res: Response) => {
  const response: (Document & { createdByFullName?: string })[] = await listDocuments(req.params.activityId);

  if (response && Array.isArray(response)) {
    for (let i = 0; i < response.length; i++) {
      const document = response[i];
      if (document.createdBy) {
        const user = await readUser(document.createdBy);
        document.createdByFullName = user ? `${user.fullName}` : '';
      }
    }
  }

  res.status(200).json(response);
};
