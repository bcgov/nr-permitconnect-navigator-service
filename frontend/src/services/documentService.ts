import comsService from './comsService';
import { appAxios } from './interceptors';

const PATH = '/document';

export default {
  /**
   * @function createDocument
   * @returns {Promise} An axios response
   */
  async createDocument(file: File, submissionId: string, bucketId: string) {
    let comsResponse;
    try {
      comsResponse = await comsService.createObject(
        file,
        {},
        { bucketId },
        { timeout: 0 } // Infinite timeout for big files upload to avoid timeout error
      );

      return appAxios().put(PATH, {
        submissionId: submissionId,
        documentId: comsResponse.data.id,
        filename: comsResponse.data.name,
        mimeType: comsResponse.data.mimeType,
        length: comsResponse.data.length
      });
    } catch (e) {
      // TODO: Delete object if Prisma write fails
    }
  },

  async listDocuments(submissionId: string) {
    try {
      return appAxios().get(`${PATH}/list/${submissionId}`);
    } catch (e) {
      console.log(e);
    }
  }
};
