import prisma from '../db/dataConnection';
import { document } from '../db/models';

const service = {
  /**
   * @function createDocument
   * Creates a link between a submission and a previously existing object in COMS
   * @param documentId COMS ID of an existing object
   * @param submissionId Submission ID the document is associated with
   * @param filename Original filename of the document
   * @param mimeType Type of document
   * @param filesize Size of document
   */
  createDocument: async (
    documentId: string,
    submissionId: string,
    filename: string,
    mimeType: string,
    filesize: number
  ) => {
    const response = await prisma.document.create({
      data: {
        document_id: documentId,
        submission_id: submissionId,
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
   * @param documentId Document ID
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
   * Retrieve a list of documents associated with a given submission
   * @param submissionId PCNS Submission ID
   * @returns Array of documents associated with the submission
   */
  listDocuments: async (submissionId: string) => {
    const response = await prisma.document.findMany({
      where: {
        submission_id: submissionId
      },
      orderBy: {
        created_at: 'asc'
      }
    });

    return response.map((x) => document.fromPrismaModel(x));
  }
};

export default service;
