import { comsAxios } from './interceptors';
import { createRouteBuilder } from './routeBuilder';
import { setDispositionHeader } from '@/utils/utils';

import type {
  CreateObjectRequest,
  CreateObjectResponse,
  DeleteObjectRequest,
  DownloadObjectRequest,
  GetObjectRequest
} from '@/types';

/**
 * Base route builder and endpoint definitions for this resource.
 * Routes should be referenced through this object rather than
 * constructing endpoint paths directly within service methods.
 */
const comsRoute = createRouteBuilder('object');

const comsRoutes = {
  root: () => comsRoute(),
  byId: (objectId: string) => comsRoute(objectId)
} as const;

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

  const { data } = await comsAxios(axiosOptions).put<CreateObjectResponse>(comsRoutes.root(), file, config);

  return data;
}

/**
 * Deletes an object.
 * @param req - The request payload containing the object ID and optional version ID.
 * @returns A promise resolving when the operation completes.
 */
export async function deleteObject(req: DeleteObjectRequest): Promise<void> {
  const { objectId, versionId } = req;

  await comsAxios().delete(comsRoutes.byId(objectId), {
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
  }).get<ArrayBuffer>(comsRoutes.byId(objectId), {
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

/**
 * Backward compatibility layer for legacy default-export service usage.
 *
 * This object preserves the previous pattern:
 *   export default { ...serviceMethods }
 *
 * It may be removed once all consumers are migrated to named imports.
 */
export const comsService = {
  createObject,
  deleteObject,
  getObject,
  downloadObject
};
