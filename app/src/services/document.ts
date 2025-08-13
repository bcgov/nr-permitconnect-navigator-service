import type { PrismaTransactionClient } from '../db/dataConnection';
import type { IStamps } from '../interfaces/IStamps';
import type { Document } from '../types';

/**
 * @function createDocument
 * Creates a link between an activity and a previously existing object in COMS
 * @param tx Prisma transaction client
 * @param documentId COMS ID of an existing object
 * @param activityId Activity ID the document is associated with
 * @param filename Original filename of the document
 * @param mimeType Type of document
 * @param filesize Size of document
 * @returns The result of running the create operation
 */
export const createDocument = async (
  tx: PrismaTransactionClient,
  documentId: string,
  activityId: string,
  filename: string,
  mimeType: string,
  filesize: number,
  createStamp: Partial<IStamps>
): Promise<Document> => {
  const response = await tx.document.create({
    data: {
      documentId: documentId,
      activityId: activityId,
      filename: filename,
      mimeType: mimeType,
      filesize: filesize,
      createdAt: createStamp.createdAt,
      createdBy: createStamp.createdBy
    }
  });

  return response;
};

/**
 * @function deleteDocument
 * Delete a document
 * @param tx Prisma transaction client
 * @param documentId PCNS Document ID
 */
export const deleteDocument = async (tx: PrismaTransactionClient, documentId: string): Promise<void> => {
  await tx.document.delete({ where: { documentId } });
};

/**
 * @function getDocument
 * Get a document
 * @param tx Prisma transaction client
 * @param documentId Document ID
 * @returns The result of running the findFirst operation
 */
export const getDocument = async (tx: PrismaTransactionClient, documentId: string): Promise<Document> => {
  const result = await tx.document.findFirstOrThrow({ where: { documentId } });

  return result;
};

/**
 * @function listDocuments
 * Retrieve a list of documents associated with a given activity
 * @param tx Prisma transaction client
 * @param activityId PCNS Activity ID
 * @returns The result of running the findMany operation
 */
export const listDocuments = async (tx: PrismaTransactionClient, activityId: string): Promise<Document[]> => {
  const response = await tx.document.findMany({
    where: {
      activityId
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  return response;
};
