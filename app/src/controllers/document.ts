import { generateCreateStamps } from '../db/utils/utils';
import { createDocument, deleteDocument, listDocuments } from '../services/document';

import type { Request, Response } from 'express';

export const createDocumentController = async (
  req: Request<
    never,
    never,
    { documentId: string; activityId: string; filename: string; mimeType: string; length: number }
  >,
  res: Response
) => {
  const response = await createDocument(
    req.body.documentId,
    req.body.activityId,
    req.body.filename,
    req.body.mimeType,
    req.body.length,
    generateCreateStamps(req.currentContext)
  );
  res.status(201).json(response);
};

export const deleteDocumentController = async (req: Request<{ documentId: string }>, res: Response) => {
  const response = await deleteDocument(req.params.documentId);

  if (!response) {
    return res.status(404).json({ message: 'Document not found' });
  }

  res.status(200).json(response);
};

export const listDocumentsController = async (req: Request<{ activityId: string }>, res: Response) => {
  const response = await listDocuments(req.params.activityId);
  res.status(200).json(response);
};
