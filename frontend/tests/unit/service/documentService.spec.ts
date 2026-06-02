import { v4 } from 'uuid';

import {
  documentService,
  createDocument,
  deleteDocument,
  downloadDocument,
  listDocuments
} from '@/services/documentService';

import comsService from '@/services/comsService';
import { appAxios } from '@/services/interceptors';
import { useAppStore } from '@/store';
import { getFilenameAndExtension } from '@/utils/utils';
import { Initiative } from '@/utils/enums/application';

vi.mock('@/services/comsService', () => ({
  default: {
    createObject: vi.fn(),
    deleteObject: vi.fn(),
    getObject: vi.fn()
  }
}));

vi.mock('@/services/interceptors', () => ({
  appAxios: vi.fn()
}));

vi.mock('@/store', () => ({
  useAppStore: vi.fn()
}));

vi.mock('uuid', () => ({
  v4: vi.fn()
}));

const mockV4 = v4 as unknown as ReturnType<typeof vi.fn>;

vi.mock('@/utils/utils', () => ({
  getFilenameAndExtension: vi.fn()
}));

describe('document service', () => {
  const mockPost = vi.fn();
  const mockGet = vi.fn();
  const mockDelete = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();

    vi.mocked(useAppStore).mockReturnValue({
      getInitiative: Initiative.HOUSING
    } as never);

    vi.mocked(appAxios).mockReturnValue({
      post: mockPost,
      get: mockGet,
      delete: mockDelete
    } as never);

    mockV4.mockReturnValue('12345678-abcd-efgh-ijkl-123456789012');

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

      const comsResponse = {
        data: {
          id: 'coms-id',
          versionId: 'version-id',
          name: 'test-file_12345678.pdf',
          mimeType: 'application/pdf',
          length: 1234
        }
      };

      const documentResponse = {
        id: 'document-id'
      };

      vi.mocked(comsService.createObject).mockResolvedValue(comsResponse as never);

      mockPost.mockResolvedValue({
        data: documentResponse
      });

      const result = await createDocument({
        activityId: 'activity-1',
        bucketId: 'bucket-1',
        document: file
      });

      expect(comsService.createObject).toHaveBeenCalledTimes(1);

      const uploadedFile = vi.mocked(comsService.createObject).mock.calls[0][0];

      expect(uploadedFile.name).toBe('test-file_12345678.pdf');

      expect(comsService.createObject).toHaveBeenCalledWith(
        expect.any(File),
        {},
        {
          bucketId: 'bucket-1',
          tagset: [
            {
              key: 'Project ID',
              value: 'activity-1'
            }
          ]
        },
        {
          timeout: 0
        }
      );

      expect(mockPost).toHaveBeenCalledWith('housing/document', {
        activityId: 'activity-1',
        documentId: 'coms-id',
        filename: 'test-file_12345678.pdf',
        mimeType: 'application/pdf',
        filesize: 1234
      });

      expect(result).toEqual(documentResponse);
    });

    it('supports files without extensions', async () => {
      vi.mocked(getFilenameAndExtension).mockReturnValue({
        filename: 'test-file',
        extension: ''
      });

      const file = new File(['content'], 'test', {
        type: 'text/plain'
      });

      vi.mocked(comsService.createObject).mockResolvedValue({
        data: {
          id: 'coms-id',
          name: 'test-file_12345678',
          mimeType: 'text/plain',
          length: 1
        }
      } as never);

      mockPost.mockResolvedValue({
        data: {}
      });

      await createDocument({
        activityId: 'activity-1',
        bucketId: 'bucket-1',
        document: file
      });

      const uploadedFile = vi.mocked(comsService.createObject).mock.calls[0][0];

      expect(uploadedFile.name).toBe('test-file_12345678');
    });

    it('cleans up COMS object when document creation fails', async () => {
      const file = new File(['content'], 'test.pdf', {
        type: 'application/pdf'
      });

      vi.mocked(comsService.createObject).mockResolvedValue({
        data: {
          id: 'coms-id',
          versionId: 'version-id',
          name: 'file.pdf',
          mimeType: 'application/pdf',
          length: 100
        }
      } as never);

      const error = new Error('api failure');

      mockPost.mockRejectedValue(error);

      vi.mocked(comsService.deleteObject).mockResolvedValue(undefined as never);

      await expect(
        createDocument({
          activityId: 'activity-1',
          bucketId: 'bucket-1',
          document: file
        })
      ).rejects.toThrow(error);

      expect(comsService.deleteObject).toHaveBeenCalledWith('coms-id', 'version-id');
    });

    it('does not attempt cleanup when COMS upload fails', async () => {
      const file = new File(['content'], 'test.pdf', {
        type: 'application/pdf'
      });

      const error = new Error('upload failed');

      vi.mocked(comsService.createObject).mockRejectedValue(error);

      await expect(
        createDocument({
          activityId: 'activity-1',
          bucketId: 'bucket-1',
          document: file
        })
      ).rejects.toThrow(error);

      expect(comsService.deleteObject).not.toHaveBeenCalled();
    });

    it('swallows cleanup failures and rethrows original error', async () => {
      const file = new File(['content'], 'test.pdf', {
        type: 'application/pdf'
      });

      vi.mocked(comsService.createObject).mockResolvedValue({
        data: {
          id: 'coms-id',
          versionId: 'version-id',
          name: 'file.pdf',
          mimeType: 'application/pdf',
          length: 100
        }
      } as never);

      const originalError = new Error('association failed');

      mockPost.mockRejectedValue(originalError);

      vi.mocked(comsService.deleteObject).mockRejectedValue(new Error('cleanup failed'));

      await expect(
        createDocument({
          activityId: 'activity-1',
          bucketId: 'bucket-1',
          document: file
        })
      ).rejects.toThrow(originalError);
    });
  });

  describe('deleteDocument', () => {
    it('deletes COMS object and document association', async () => {
      vi.mocked(comsService.deleteObject).mockResolvedValue(undefined as never);

      mockDelete.mockResolvedValue({});

      await deleteDocument({
        documentId: 'document-1',
        versionId: 'version-1'
      });

      expect(comsService.deleteObject).toHaveBeenCalledWith('document-1', 'version-1');

      expect(mockDelete).toHaveBeenCalledWith('housing/document/document-1', {
        params: {
          versionId: 'version-1'
        }
      });
    });

    it('swallows COMS deletion errors', async () => {
      vi.mocked(comsService.deleteObject).mockRejectedValue(new Error('failed'));

      await expect(
        deleteDocument({
          documentId: 'document-1',
          versionId: 'version-1'
        })
      ).resolves.toBeUndefined();
    });

    it('swallows API deletion errors', async () => {
      vi.mocked(comsService.deleteObject).mockResolvedValue(undefined as never);

      mockDelete.mockRejectedValue(new Error('api failed'));

      await expect(
        deleteDocument({
          documentId: 'document-1',
          versionId: 'version-1'
        })
      ).resolves.toBeUndefined();
    });
  });

  describe('downloadDocument', () => {
    it('downloads document from COMS', async () => {
      vi.mocked(comsService.getObject).mockResolvedValue(undefined as never);

      await downloadDocument({
        documentId: 'document-1',
        filename: 'file.pdf',
        versionId: 'version-1'
      });

      expect(comsService.getObject).toHaveBeenCalledWith('document-1', 'file.pdf', 'version-1');
    });
  });

  describe('listDocuments', () => {
    it('returns activity documents', async () => {
      const documents = [{ id: '1' }, { id: '2' }];

      mockGet.mockResolvedValue({
        data: documents
      });

      const result = await listDocuments({
        activityId: 'activity-1'
      });

      expect(mockGet).toHaveBeenCalledWith('housing/document/list/activity-1');

      expect(result).toEqual(documents);
    });

    it('propagates errors', async () => {
      const error = new Error('failed');

      mockGet.mockRejectedValue(error);

      await expect(
        listDocuments({
          activityId: 'activity-1'
        })
      ).rejects.toThrow(error);
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
