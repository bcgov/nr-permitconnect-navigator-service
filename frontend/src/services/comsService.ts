import { comsAxios } from './interceptors';
import { setDispositionHeader } from '@/utils/utils';

import type { AxiosRequestConfig } from 'axios';

const PATH = 'object';

export default {
  /**
   * @function createObject
   * Post an object
   * @param {any} object Object to be created
   * @param {string} bucketId Bucket id containing the object
   * @param {AxiosRequestConfig} axiosOptions Axios request config options
   * @returns {Promise} An axios response
   */
  async createObject(
    object: any,
    headers: {
      metadata?: Array<{ key: string; value: string }>;
    },
    params: {
      bucketId?: string;
      tagset?: Array<{ key: string; value: string }>;
    },
    axiosOptions?: AxiosRequestConfig
  ) {
    // setDispositionHeader constructs header based on file name
    // Content-Type defaults octet-stream if MIME type unavailable
    const config = {
      headers: {
        'Content-Disposition': setDispositionHeader(object.name),
        'Content-Type': object?.type ?? 'application/octet-stream'
      },
      params: {
        bucketId: params.bucketId,
        tagset: {}
      }
    };

    // Map the metadata if required
    if (headers.metadata) {
      config.headers = {
        ...config.headers,
        ...Object.fromEntries(headers.metadata.map((x: { key: string; value: string }) => [x.key, x.value]))
      };
    }

    // Map the tagset if required
    if (params.tagset) {
      config.params.tagset = Object.fromEntries(
        params.tagset.map((x: { key: string; value: string }) => [x.key, x.value])
      );
    }

    return comsAxios(axiosOptions).put(PATH, object, config);
  },

  /**
   * @function deleteObject
   * Delete an object
   * @param {string} objectId The id for the object to delete
   * @param {string} versionId An optional versionId
   * @returns {Promise} An axios response
   */
  deleteObject(objectId: string, versionId?: string) {
    return comsAxios().delete(`${PATH}/${objectId}`, {
      params: {
        versionId: versionId
      }
    });
  },

  /**
   * @function getObject
   * Get an object
   * @param {string} objectId The id for the object to get
   * @param {string} filename The filename to be given to the object
   * @param {string} versionId An optional versionId
   */
  getObject(objectId: string, filename: string, versionId?: string) {
    // Running in 'proxy' download mode only, could add options for other modes if needed
    return comsAxios({ responseType: 'arraybuffer' })
      .get(`${PATH}/${objectId}`, {
        params: {
          versionId: versionId,
          download: 'proxy'
        }
      })
      .then((response) => {
        const blob = new Blob([response.data], {
          type: 'attachment'
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      });
  }
};
