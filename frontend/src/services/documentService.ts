import { v4 as uuidv4 } from 'uuid';

import { api } from './apiClient';
import { comsService } from './comsService';
import { createInitiativeRouteBuilder } from './routeBuilder';
import { getFilenameAndExtension } from '@/utils/utils';

import type {
  CreateDocumentRequest,
  DeleteDocumentRequest,
  Document,
  DownloadDocumentRequest,
  ListDocumentsRequest
} from '@/types';

/**
 * Base route builder and endpoint definitions for this resource.
 * Routes should be referenced through this object rather than
 * constructing endpoint paths directly within service methods.
 */
const documentRoute = createInitiativeRouteBuilder('document');

const documentRoutes = {
  root: () => documentRoute(),
  byId: (documentId: string) => documentRoute(documentId),
  list: (activityId: string) => documentRoute('list', activityId)
} as const;

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
    const PROJECT_ID = 'Project ID';
    const tagset: { key: string; value: string }[] = [{ key: PROJECT_ID, value: activityId }];

    // Create COMS object
    comsResponse = await comsService.createObject({
      file: newDocument,
      bucketId,
      tagset,
      axiosOptions: { timeout: 0 } // Infinite timeout for big documents upload to avoid timeout error
    });

    // Create document link
    return await api.post<Document>(documentRoutes.root(), {
      activityId: activityId,
      documentId: comsResponse.id,
      filename: comsResponse.name,
      mimeType: comsResponse.mimeType,
      filesize: comsResponse.length
    });
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
export async function deleteDocument(req: DeleteDocumentRequest): Promise<void> {
  const { documentId, versionId } = req;

  try {
    await comsService.deleteObject({ objectId: documentId, versionId });
    return await api.delete(documentRoutes.byId(documentId), {
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
export async function downloadDocument(req: DownloadDocumentRequest): Promise<void> {
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
  return api.get<Document[]>(documentRoutes.list(activityId));
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
