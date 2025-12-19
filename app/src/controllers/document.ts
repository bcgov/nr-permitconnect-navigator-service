import { generateCreateStamps } from '../db/utils/utils.ts';
import { createDocument, deleteDocument, listDocuments } from '../services/document.ts';
import { readUser } from '../services/user.ts';
import { transactionWrapper } from '../db/utils/transactionWrapper.ts';

import type { Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/dataConnection.ts';
import type { Document } from '../types/index.ts';

export const createDocumentController = async (
  req: Request<
    never,
    never,
    { documentId: string; activityId: string; filename: string; mimeType: string; filesize: number }
  >,
  res: Response
) => {
  const result = await transactionWrapper<Document>(async (tx: PrismaTransactionClient) => {
    const created = await createDocument(
      tx,
      req.body.documentId,
      req.body.activityId,
      req.body.filename,
      req.body.mimeType,
      req.body.filesize,
      generateCreateStamps(req.currentContext)
    );

    let createdByFullName: string | undefined;
    if (created.createdBy) {
      const user = await readUser(tx, created.createdBy);
      createdByFullName = user ? (user.fullName ?? '') : '';
    }

    return { ...created, ...(createdByFullName ? { createdByFullName } : {}) };
  });

  res.status(201).json(result);
};

export const deleteDocumentController = async (req: Request<{ documentId: string }>, res: Response) => {
  await transactionWrapper(async (tx: PrismaTransactionClient) => {
    await deleteDocument(tx, req.params.documentId);
  });
  res.status(204).end();
};

export const listDocumentsController = async (req: Request<{ activityId: string }>, res: Response) => {
  const response = await transactionWrapper<Document[]>(async (tx: PrismaTransactionClient) => {
    const documents: Document[] = await listDocuments(tx, req.params.activityId);

    const documentsWithNames: Document[] = await Promise.all(
      documents.map(async (doc) => {
        if (!doc.createdBy) return doc;
        const user = await readUser(tx, doc.createdBy);
        return { ...doc, createdByFullName: user ? `${user.fullName}` : '' };
      })
    );

    return documentsWithNames;
  });

  res.status(200).json(response);
};
