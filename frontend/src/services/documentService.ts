import { v4 as uuidv4 } from 'uuid';

import comsService from './comsService';
import { appAxios } from './interceptors';
import { getFilenameAndExtension } from '@/utils/utils';

const PATH = '/document';

export default {
  /**
   * @function createDocument
   * @returns {Promise} An axios response
   */
  async createDocument(document: File, activityId: string, bucketId: string) {
    let comsResponse;
    try {
      // Add a unique hash to the end of the filename
      const hash = uuidv4();
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
      return await appAxios().put(PATH, {
        activityId: activityId,
        documentId: comsResponse.data.id,
        filename: comsResponse.data.name,
        mimeType: comsResponse.data.mimeType,
        length: comsResponse.data.length
      });
    } catch (e) {
      // In event of any error try to Delete COMS object if it was created
      if (comsResponse) {
        await comsService.deleteObject(comsResponse.data.id, comsResponse.data.versionId);
      }
    }
  },

  /**
   * @function deleteDocument
   * @returns {Promise} An axios response
   */
  async deleteDocument(documentId: string, versionId?: string) {
    try {
      await comsService.deleteObject(documentId, versionId);
      await appAxios().delete(`${PATH}/${documentId}`, {
        params: {
          versionId: versionId
        }
      });
    } catch (e) {
      // TODO: If one fails and other doesn't then??
    }
  },

  /**
   * @function downloadDocument
   * @returns {Promise} An axios response
   */
  async downloadDocument(documentId: string, versionId?: string) {
    await comsService.getObject(documentId, versionId);
  },

  /**
   * @function listDocuments
   * @returns {Promise} An axios response
   */
  async listDocuments(activityId: string) {
    return appAxios().get(`${PATH}/list/${activityId}`);
  }
};
