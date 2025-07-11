import prisma from '../db/dataConnection';
import { IStamps } from '../interfaces/IStamps';
import { Document } from '../types';

const service = {
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
  createDocument: async (
    documentId: string,
    activityId: string,
    filename: string,
    mimeType: string,
    filesize: number,
    createStamp: Partial<IStamps>
  ) => {
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
    const doc: Document = response;
    if (response.createdBy) {
      // getting uploaded by information for the new document
      const user = await prisma.user.findFirst({
        where: {
          userId: response.createdBy
        }
      });
      doc.createdByFullName = user ? `${user.fullName}` : '';
    }
    return response;
  },

  /**
   * @function deleteDocument
   * Delete a document
   * @param {string} documentId PCNS Document ID
   * @returns {Promise<Document | null>} The result of running the delete operation
   */
  deleteDocument: async (documentId: string) => {
    const response = await prisma.document.delete({ where: { documentId } });

    return response;
  },

  /**
   * @function getDocument
   * Get a document
   * @param {string} documentId Document ID
   * @returns {Promise<PermitType[]>} The result of running the findFirst operation
   */
  getDocument: async (documentId: string): Promise<Document | null> => {
    const result = await prisma.document.findFirst({ where: { documentId } });

    return result ?? null;
  },

  /**
   * @function listDocuments
   * Retrieve a list of documents associated with a given activity
   * @param {string} activityId PCNS Activity ID
   * @returns {Promise<(Document | null)[]>} The result of running the findMany operation
   */
  listDocuments: async (activityId: string) => {
    const response = await prisma.document.findMany({
      where: {
        activityId
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    const documents = response;
    if (documents && Array.isArray(documents)) {
      for (let i = 0; i < documents.length; i++) {
        const document: Document = documents[i];
        if (document.createdBy) {
          const user = await prisma.user.findFirst({
            where: {
              userId: document.createdBy as string
            }
          });
          document.createdByFullName = user ? user.fullName : '';
        }
      }
    }
    return documents;
  }
};

export default service;
