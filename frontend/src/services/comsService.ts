import type {
  CreateObjectRequest,
  CreateObjectResponse,
  DeleteObjectRequest,
  DownloadObjectRequest,
  GetObjectRequest
} from '@/types';
import { comsAxios } from './interceptors';
import { setDispositionHeader } from '@/utils/utils';

const PATH = 'object';

/**
 * Creates an object in COMS.
 * @param req - The request payload containing the file, metadata, and upload options.
 * @returns A promise resolving to the created object.
 */
export async function createObject(req: CreateObjectRequest): Promise<CreateObjectResponse> {
  const { file, metadata, bucketId, tagset, axiosOptions } = req;

  const config = {
    headers: {
      'Content-Disposition': setDispositionHeader(file.name),
      'Content-Type': file.type?.trim() || 'application/octet-stream'
    },
    params: {
      bucketId,
      tagset: {}
    }
  };

  if (metadata?.length) {
    config.headers = {
      ...config.headers,
      ...Object.fromEntries(metadata.map(({ key, value }) => [key, value]))
    };
  }

  if (tagset?.length) {
    config.params.tagset = Object.fromEntries(tagset.map(({ key, value }) => [key, value]));
  }

  const { data } = await comsAxios(axiosOptions).put<CreateObjectResponse>(PATH, file, config);

  return data;
}

/**
 * Deletes an object.
 * @param req - The request payload containing the object ID and optional version ID.
 * @returns A promise resolving when the operation completes.
 */
export async function deleteObject(req: DeleteObjectRequest): Promise<void> {
  const { objectId, versionId } = req;

  await comsAxios().delete(`${PATH}/${objectId}`, {
    params: {
      versionId
    }
  });
}

/**
 * Downloads an object.
 * @param req - The request payload containing the object ID and optional version ID.
 * @returns A promise resolving to the object contents.
 */
export async function getObject(req: GetObjectRequest): Promise<ArrayBuffer> {
  const { objectId, versionId } = req;

  const { data } = await comsAxios({
    responseType: 'arraybuffer'
  }).get<ArrayBuffer>(`${PATH}/${objectId}`, {
    params: {
      versionId,
      download: 'proxy'
    }
  });

  return data;
}

/**
 * Triggers a browser download for an object.
 * @param req - The request payload containing the object ID, filename, and optional version ID.
 */
export async function downloadObject(req: DownloadObjectRequest): Promise<void> {
  const data = await getObject(req);

  const blob = new Blob([data], {
    type: 'attachment'
  });

  const url = window.URL.createObjectURL(blob);

  const anchor = document.createElement('a');

  anchor.style.display = 'none';
  anchor.href = url;
  anchor.download = req.filename;
  anchor.click();

  window.URL.revokeObjectURL(url);
  anchor.remove();
}

/** Hybrid default export object for backward compatibility */
export const comsService = {
  createObject,
  deleteObject,
  getObject,
  downloadObject
};
