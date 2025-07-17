import prisma from '../db/dataConnection';
import { IStamps } from '../interfaces/IStamps';
import { Document } from '../types';

/**
 * @function createDocument
 * Creates a link between an activity and a previously existing object in COMS
 * @param {string} documentId COMS ID of an existing object
 * @param {string} activityId Activity ID the document is associated with
 * @param {string} filename Original filename of the document
 * @param {string} mimeType Type of document
 * @param {number} filesize Size of document
 * @returns {Promise<Document | null>} The result of running the create operation
 */
export const createDocument = async (
  documentId: string,
  activityId: string,
  filename: string,
  mimeType: string,
  filesize: number,
  createStamp: Partial<IStamps>
): Promise<Document> => {
  const response = await prisma.document.create({
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
 * @param {string} documentId PCNS Document ID
 * @returns {Promise<Document | null>} The result of running the delete operation
 */
export const deleteDocument = async (documentId: string): Promise<Document> => {
  const response = await prisma.document.delete({ where: { documentId } });

  return response;
};

/**
 * @function getDocument
 * Get a document
 * @param {string} documentId Document ID
 * @returns {Promise<PermitType[]>} The result of running the findFirst operation
 */
export const getDocument = async (documentId: string): Promise<Document> => {
  const result = await prisma.document.findFirstOrThrow({ where: { documentId } });

  return result;
};

/**
 * @function listDocuments
 * Retrieve a list of documents associated with a given activity
 * @param {string} activityId PCNS Activity ID
 * @returns {Promise<(Document | null)[]>} The result of running the findMany operation
 */
export const listDocuments = async (activityId: string): Promise<Document[]> => {
  const response = await prisma.document.findMany({
    where: {
      activityId
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  return response;
};
