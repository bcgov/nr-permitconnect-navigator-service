import { unitOfWork } from '../repository/unitOfWork.ts';

import type { Document } from '../types/index.ts';

/**
 * Creates a link between an activity and a previously existing object in COMS
 * @param documentId - COMS ID of an existing object
 * @param activityId - Activity ID the document is associated with
 * @param filename - Original filename of the document
 * @param mimeType - Type of document
 * @param filesize - Size of document
 * @returns A Promise that resolves to the created resource
 */
export const createDocumentService = async (
  documentId: string,
  activityId: string,
  filename: string,
  mimeType: string,
  filesize: number
): Promise<Document> => {
  return await unitOfWork.execute(async ({ document, user }) => {
    const createdDocument = await document.create({ documentId, activityId, filename, mimeType, filesize });

    let createdByFullName: string | undefined;
    if (createdDocument.createdBy) {
      const createdBy = await user.findUnique({
        where: {
          userId: createdDocument.createdBy
        }
      });
      createdByFullName = createdBy ? (createdBy.fullName ?? '') : '';
    }

    return { ...createdDocument, ...(createdByFullName ? { createdByFullName } : {}) };
  });
};

/**
 * Delete a document
 * @param documentId - Document ID
 * @returns A Promise that resolves when the operation is complete
 */
export const deleteDocumentService = async (documentId: string): Promise<void> => {
  return await unitOfWork.execute(async ({ document }) => {
    await document.delete({ documentId });
  });
};

/**
 * Retrieve a list of documents associated with a given activity
 * @param activityId - Activity ID
 * @returns A Promise that resolves to an array of documents
 */
export const listDocumentsService = async (activityId: string): Promise<Document[]> => {
  return await unitOfWork.execute(async ({ document, user }) => {
    const documents: Document[] = await document.findMany({
      where: {
        activityId
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    const documentsWithNames: Document[] = await Promise.all(
      documents.map(async (doc) => {
        if (!doc.createdBy) return doc;
        const createdBy = await await user.findUnique({
          where: {
            userId: doc.createdBy
          }
        });
        const createdByFullName = createdBy ? (createdBy.fullName ?? '') : '';
        return { ...doc, ...(createdByFullName ? { createdByFullName } : {}) };
      })
    );

    return documentsWithNames;
  });
};
