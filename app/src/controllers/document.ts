import { createDocumentService, deleteDocumentService, listDocumentsService } from '../services/document.ts';

import type { Request, Response } from 'express';

export const createDocumentController = async (
  req: Request<
    never,
    never,
    { documentId: string; activityId: string; filename: string; mimeType: string; filesize: number }
  >,
  res: Response
) => {
  const response = await createDocumentService(
    req.body.documentId,
    req.body.activityId,
    req.body.filename,
    req.body.mimeType,
    req.body.filesize
  );
  res.status(201).json(response);
};

export const deleteDocumentController = async (req: Request<{ documentId: string }>, res: Response) => {
  await deleteDocumentService(req.params.documentId);
  res.status(204).end();
};

export const listDocumentsController = async (req: Request<{ activityId: string }>, res: Response) => {
  const response = await listDocumentsService(req.params.activityId);
  res.status(200).json(response);
};
