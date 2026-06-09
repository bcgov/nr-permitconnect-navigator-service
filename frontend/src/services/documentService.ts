import { v4 as uuidv4 } from 'uuid';

import { comsService } from './comsService';
import { appAxios } from './interceptors';
import { useAppStore } from '@/store';
import { getFilenameAndExtension } from '@/utils/utils';

import type {
  CreateDocumentRequest,
  DeleteDocumentRequest,
  Document,
  DownloadDocumentRequest,
  ListDocumentsRequest
} from '@/types';

const PATH = 'document';
const PROJECT_ID = 'Project ID';

/**
 * Uploads a file to COMS and creates a document association.
 * @param req - The request payload containing path parameters and the file.
 * @returns A promise resolving to the created `Document` resource.
 */
export async function createDocument(req: CreateDocumentRequest): Promise<Document> {
  const { activityId, bucketId, document } = req;

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

    // The tagset is used to filter the objects in the bucket
    const tagset: { key: string; value: string }[] = [{ key: PROJECT_ID, value: activityId }];

    // Create COMS object
    comsResponse = await comsService.createObject({
      file: newDocument,
      bucketId,
      tagset,
      axiosOptions: { timeout: 0 } // Infinite timeout for big documents upload to avoid timeout error
    });

    // Create document link
    const { data } = await appAxios().post<Document>(`${useAppStore().getInitiative.toLowerCase()}/${PATH}`, {
      activityId: activityId,
      documentId: comsResponse.id,
      filename: comsResponse.name,
      mimeType: comsResponse.mimeType,
      filesize: comsResponse.length
    });

    return data;
  } catch (e) {
    // In event of any error try to Delete COMS object if it was created
    if (comsResponse) {
      comsService.deleteObject({ objectId: comsResponse.id, versionId: comsResponse.versionId }).catch(() => {});
    }
    throw e;
  }
}

/**
 * Deletes a document from COMS and removes its associated document record.
 * @param req - The request payload containing the document identifier and version identifier.
 * @returns A promise that resolves when the document and its association have been deleted.
 */
export async function deleteDocument(req: DeleteDocumentRequest) {
  const { documentId, versionId } = req;

  try {
    await comsService.deleteObject({ objectId: documentId, versionId });
    await appAxios().delete(`${useAppStore().getInitiative.toLowerCase()}/${PATH}/${documentId}`, {
      params: {
        versionId: versionId
      }
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    // TODO: If one fails and other doesn't then??
  }
}

/**
 * Downloads a document from COMS.
 * @param req - The request payload containing the document identifier, filename, and optional version identifier.
 * @returns A promise that resolves when the document download has been initiated or completed.
 */
export async function downloadDocument(req: DownloadDocumentRequest) {
  const { documentId, filename, versionId } = req;
  await comsService.downloadObject({ objectId: documentId, filename, versionId });
}

/**
 * Retrieves all documents associated with a specific activity.
 * @param req - The request payload containing the activity identifier.
 * @returns A promise resolving to an array of `Document` resources associated with the activity.
 */
export async function listDocuments(req: ListDocumentsRequest): Promise<Document[]> {
  const { activityId } = req;
  const { data } = await appAxios().get<Document[]>(
    `${useAppStore().getInitiative.toLowerCase()}/${PATH}/list/${activityId}`
  );
  return data;
}

/**
 * Backward compatibility layer for legacy default-export service usage.
 *
 * This object preserves the previous pattern:
 *   export default { ...serviceMethods }
 *
 * It may be removed once all consumers are migrated to named imports.
 */
export const documentService = {
  createDocument,
  deleteDocument,
  downloadDocument,
  listDocuments
};
