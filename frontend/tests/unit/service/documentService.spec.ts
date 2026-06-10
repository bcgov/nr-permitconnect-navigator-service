import {
  createDocument,
  deleteDocument,
  downloadDocument,
  listDocuments,
  documentService
} from '@/services/documentService';

import { comsService } from '@/services/comsService';
import { appAxios } from '@/services/interceptors';
import { useAppStore } from '@/store';
import { getFilenameAndExtension } from '@/utils/utils';
import { Initiative } from '@/utils/enums/application';
import type { CreateObjectResponse } from '@/types';

vi.mock('@/services/comsService', () => ({
  comsService: {
    createObject: vi.fn(),
    deleteObject: vi.fn(),
    downloadObject: vi.fn()
  }
}));

vi.mock('@/services/interceptors', () => ({
  appAxios: vi.fn()
}));

vi.mock('@/store', () => ({
  useAppStore: vi.fn()
}));

vi.mock('uuid', () => ({
  v4: vi.fn(() => '12345678-abcd-efgh-ijkl-123456789012')
}));

vi.mock('@/utils/utils', () => ({
  getFilenameAndExtension: vi.fn()
}));

/**
 * COMS response factory
 */
const createComsResponse = (overrides?: Partial<CreateObjectResponse>): CreateObjectResponse =>
  ({
    id: 'coms-id',
    versionId: 'version-id',
    name: 'file.pdf',
    mimeType: 'application/pdf',
    length: 1234,
    path: '',
    public: false,
    active: true,
    bucketId: '',
    createdAt: '',
    createdBy: '',
    updatedAt: '',
    updatedBy: '',
    lastSyncedDate: '',
    metadata: {},
    tags: {},
    $metadata: {
      httpStatusCode: 200,
      extendedRequestId: '',
      attempts: 1,
      totalRetryDelay: 0
    },
    ETag: '',
    Bucket: '',
    Key: '',
    Location: '',
    ServerSideEncryption: '',
    s3VersionId: '',
    ...overrides
  }) as CreateObjectResponse;

describe('document service', () => {
  const mockPost = vi.fn();
  const mockGet = vi.fn();
  const mockDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAppStore).mockReturnValue({
      getInitiative: Initiative.HOUSING
    } as never);

    vi.mocked(appAxios).mockReturnValue({
      post: mockPost,
      get: mockGet,
      delete: mockDelete
    } as never);

    vi.mocked(getFilenameAndExtension).mockReturnValue({
      filename: 'test-file',
      extension: 'pdf'
    });
  });

  describe('createDocument', () => {
    it('uploads to COMS and creates document association', async () => {
      const file = new File(['content'], 'test.pdf', {
        type: 'application/pdf'
      });

      vi.mocked(comsService.createObject).mockResolvedValue(
        createComsResponse({
          name: 'test-file_12345678.pdf',
          mimeType: 'application/pdf',
          length: 1234
        })
      );

      const documentResponse = { id: 'document-id' };
      mockPost.mockResolvedValue({ data: documentResponse });

      const result = await createDocument({
        activityId: 'activity-1',
        bucketId: 'bucket-1',
        document: file
      });

      expect(comsService.createObject).toHaveBeenCalled();

      const uploadedFile = vi.mocked(comsService.createObject).mock.calls[0][0].file;

      expect(uploadedFile.name).toBe('test-file_12345678.pdf');

      expect(mockPost).toHaveBeenCalledWith(
        'housing/document',
        {
          activityId: 'activity-1',
          documentId: 'coms-id',
          filename: 'test-file_12345678.pdf',
          mimeType: 'application/pdf',
          filesize: 1234
        },
        undefined
      );

      expect(result).toEqual(documentResponse);
    });

    it('supports files without extensions', async () => {
      vi.mocked(getFilenameAndExtension).mockReturnValue({
        filename: 'test-file',
        extension: ''
      });

      vi.mocked(comsService.createObject).mockResolvedValue(
        createComsResponse({
          name: 'test-file_12345678'
        })
      );

      mockPost.mockResolvedValue({ data: {} });

      await createDocument({
        activityId: 'activity-1',
        bucketId: 'bucket-1',
        document: new File(['content'], 'test', {
          type: 'text/plain'
        })
      });

      const uploadedFile = vi.mocked(comsService.createObject).mock.calls[0][0].file;

      expect(uploadedFile.name).toBe('test-file_12345678');
    });

    it('cleans up COMS object when document creation fails', async () => {
      vi.mocked(comsService.createObject).mockResolvedValue(createComsResponse());

      mockPost.mockRejectedValue(new Error('api failure'));

      vi.mocked(comsService.deleteObject).mockResolvedValue(undefined);

      await expect(
        createDocument({
          activityId: 'activity-1',
          bucketId: 'bucket-1',
          document: new File(['content'], 'test.pdf')
        })
      ).rejects.toThrow('api failure');

      expect(comsService.deleteObject).toHaveBeenCalledWith({
        objectId: 'coms-id',
        versionId: 'version-id'
      });
    });

    it('does not attempt cleanup when COMS upload fails', async () => {
      vi.mocked(comsService.createObject).mockRejectedValue(new Error('upload failed'));

      await expect(
        createDocument({
          activityId: 'activity-1',
          bucketId: 'bucket-1',
          document: new File(['content'], 'test.pdf')
        })
      ).rejects.toThrow('upload failed');

      expect(comsService.deleteObject).not.toHaveBeenCalled();
    });

    it('swallows cleanup failures and rethrows original error', async () => {
      vi.mocked(comsService.createObject).mockResolvedValue(createComsResponse());

      mockPost.mockRejectedValue(new Error('association failed'));
      vi.mocked(comsService.deleteObject).mockRejectedValue(new Error('cleanup failed'));

      await expect(
        createDocument({
          activityId: 'activity-1',
          bucketId: 'bucket-1',
          document: new File(['content'], 'test.pdf')
        })
      ).rejects.toThrow('association failed');
    });
  });

  describe('deleteDocument', () => {
    it('deletes COMS object and document association', async () => {
      vi.mocked(comsService.deleteObject).mockResolvedValue(undefined);
      mockDelete.mockResolvedValue({});

      await deleteDocument({
        documentId: 'document-1',
        versionId: 'version-1'
      });

      expect(comsService.deleteObject).toHaveBeenCalledWith({
        objectId: 'document-1',
        versionId: 'version-1'
      });

      expect(mockDelete).toHaveBeenCalled();
    });
  });

  describe('downloadDocument', () => {
    it('delegates to COMS downloadObject', async () => {
      vi.mocked(comsService.downloadObject).mockResolvedValue(undefined);

      await downloadDocument({
        documentId: 'document-1',
        filename: 'file.pdf',
        versionId: 'version-1'
      });

      expect(comsService.downloadObject).toHaveBeenCalledWith({
        objectId: 'document-1',
        filename: 'file.pdf',
        versionId: 'version-1'
      });
    });
  });

  describe('listDocuments', () => {
    it('returns activity documents', async () => {
      const documents = [{ id: '1' }, { id: '2' }];

      mockGet.mockResolvedValue({ data: documents });

      const result = await listDocuments({
        activityId: 'activity-1'
      });

      expect(mockGet).toHaveBeenCalledWith('housing/document/list/activity-1', undefined);

      expect(result).toEqual(documents);
    });

    it('propagates errors', async () => {
      mockGet.mockRejectedValue(new Error('failed'));

      await expect(listDocuments({ activityId: 'activity-1' })).rejects.toThrow('failed');
    });
  });

  it('exports all service functions', () => {
    expect(documentService).toEqual({
      createDocument,
      deleteDocument,
      downloadDocument,
      listDocuments
    });
  });
});
