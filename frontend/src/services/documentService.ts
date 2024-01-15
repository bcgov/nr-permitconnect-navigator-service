import { v4 } from 'uuid';

import comsService from './comsService';
import { appAxios } from './interceptors';
import { getFilenameAndExtension } from '@/utils/utils';

const PATH = '/document';

export default {
  /**
   * @function createDocument
   * @returns {Promise} An axios response
   */
  async createDocument(document: File, submissionId: string, bucketId: string) {
    let comsResponse;
    try {
      // Add a unique hash to the end of the filename
      const hash = v4();
      const fileAndExt = getFilenameAndExtension(document.name);
      let newDocumentName = `${fileAndExt.filename}_${hash.substring(0, 8)}`;
      if (fileAndExt.extension) {
        newDocumentName = `${newDocumentName}.${fileAndExt.extension}`;
      }
      const newDocument = new File([document], newDocumentName, { type: document.type });

      // Create COMS object
      comsResponse = await comsService.createObject(
        newDocument,
        {},
        { bucketId },
        { timeout: 0 } // Infinite timeout for big documents upload to avoid timeout error
      );

      // Create document link
      return appAxios().put(PATH, {
        submissionId: submissionId,
        documentId: comsResponse.data.id,
        filename: comsResponse.data.name,
        mimeType: comsResponse.data.mimeType,
        length: comsResponse.data.length
      });
    } catch (e) {
      // TODO: Delete COMS object if Prisma write fails
    }
  },

  async listDocuments(submissionId: string) {
    return appAxios().get(`${PATH}/list/${submissionId}`);
  }
};
