import type { PrismaTransactionClient } from '../db/dataConnection';
import type { IStamps } from '../interfaces/IStamps';
import type { Document } from '../types';

/**
 * Creates a link between an activity and a previously existing object in COMS
 * @param tx Prisma transaction client
 * @param documentId COMS ID of an existing object
 * @param activityId Activity ID the document is associated with
 * @param filename Original filename of the document
 * @param mimeType Type of document
 * @param filesize Size of document
 * @returns A Promise that resolves to the created resource
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
 * Delete a document
 * @param tx Prisma transaction client
 * @param documentId PCNS Document ID
 */
export const deleteDocument = async (tx: PrismaTransactionClient, documentId: string): Promise<void> => {
  await tx.document.delete({ where: { documentId } });
};

/**
 * Get a document
 * @param tx Prisma transaction client
 * @param documentId Document ID
 * @returns A Promise that resolves to the specific document
 */
export const getDocument = async (tx: PrismaTransactionClient, documentId: string): Promise<Document> => {
  const result = await tx.document.findFirstOrThrow({ where: { documentId } });

  return result;
};

/**
 * Retrieve a list of documents associated with a given activity
 * @param tx Prisma transaction client
 * @param activityId PCNS Activity ID
 * @returns A Promise that resolves to an array of documents
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
