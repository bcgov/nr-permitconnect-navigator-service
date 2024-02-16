import prisma from '../db/dataConnection';
import { document } from '../db/models';

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
    filesize: number
  ) => {
    const response = await prisma.document.create({
      data: {
        document_id: documentId,
        activity_id: activityId,
        filename: filename,
        mime_type: mimeType,
        filesize: filesize
      }
    });

    return document.fromPrismaModel(response);
  },

  /**
   * @function deleteDocument
   * Delete a document
   * @param {string} documentId PCNS Document ID
   * @returns {Promise<Document | null>} The result of running the delete operation
   */
  deleteDocument: async (documentId: string) => {
    const response = await prisma.document.delete({
      where: {
        document_id: documentId
      }
    });

    return document.fromPrismaModel(response);
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
        activity_id: activityId
      },
      orderBy: {
        created_at: 'asc'
      }
    });

    return response.map((x) => document.fromPrismaModel(x));
  }
};

export default service;
