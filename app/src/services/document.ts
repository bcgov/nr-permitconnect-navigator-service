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
    filesize: number,
    userId: string //userId added to track who uploaded the document
  ) => {
    const response = await prisma.document.create({
      data: {
        document_id: documentId,
        activity_id: activityId,
        filename: filename,
        mime_type: mimeType,
        filesize: filesize,
        created_by: userId //created_by added to track who uploaded the document
      }
    });
    const doc = document.fromPrismaModel(response);
    if (response.created_by) {
      // getting uploaded by information for the new document
      const user = await prisma.user.findFirst({
        where: {
          user_id: response.created_by
        }
      });
      doc.createdByFullName = user ? `${user.full_name}` : '';
    }
    return doc;
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
   * @function getDocument
   * Get a document
   * @param {string} documentId Document ID
   * @returns {Promise<PermitType[]>} The result of running the findFirst operation
   */
  getDocument: async (documentId: string) => {
    const result = await prisma.document.findFirst({
      where: {
        document_id: documentId
      }
    });

    return result ? document.fromPrismaModel(result) : null;
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

    const documents = response.map((x) => document.fromPrismaModel(x));
    if (documents && Array.isArray(documents)) {
      for (let i = 0; i < documents.length; i++) {
        if (documents[i].createdBy) {
          const user = await prisma.user.findFirst({
            where: {
              user_id: documents[i].createdBy as string
            }
          });
          documents[i].createdByFullName = user ? user.full_name : '';
        }
      }
    }
    return documents;
  }
};

export default service;
