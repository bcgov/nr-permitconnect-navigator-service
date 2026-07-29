import { mockReset } from 'vitest-mock-extended';

import { TEST_DOCUMENT_1, TEST_IDIR_USER_1 } from '../data/index.ts';
import { mockRepos } from '../../__mocks__/unitOfWorkMock.ts';
import { createDocumentService, deleteDocumentService, listDocumentsService } from '../../../src/services/document.ts';

import type { Document } from '../../../src/types/index.ts';

vi.mock('config');

describe('document service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReset(mockRepos);
  });

  describe('createDocumentService', () => {
    it('creates document and returns with createdByFullName when user exists', async () => {
      const docWithCreatedBy: Document = {
        ...TEST_DOCUMENT_1,
        createdBy: TEST_IDIR_USER_1.userId
      };

      mockRepos.document.create.mockResolvedValue(docWithCreatedBy);
      mockRepos.user.findById.mockResolvedValue(TEST_IDIR_USER_1);

      const result = await createDocumentService(
        TEST_DOCUMENT_1.documentId,
        TEST_DOCUMENT_1.activityId as string,
        TEST_DOCUMENT_1.filename,
        TEST_DOCUMENT_1.mimeType,
        TEST_DOCUMENT_1.filesize
      );

      expect(mockRepos.document.create).toHaveBeenCalledTimes(1);
      expect(mockRepos.document.create).toHaveBeenCalledWith({
        documentId: TEST_DOCUMENT_1.documentId,
        activityId: TEST_DOCUMENT_1.activityId,
        filename: TEST_DOCUMENT_1.filename,
        mimeType: TEST_DOCUMENT_1.mimeType,
        filesize: TEST_DOCUMENT_1.filesize
      });
      expect(mockRepos.user.findById).toHaveBeenCalledTimes(1);
      expect(mockRepos.user.findById).toHaveBeenCalledWith(TEST_IDIR_USER_1.userId);
      expect(result).toEqual({ ...docWithCreatedBy, createdByFullName: TEST_IDIR_USER_1.fullName });
    });

    it('creates document without user lookup when createdBy is null', async () => {
      mockRepos.document.create.mockResolvedValue(TEST_DOCUMENT_1);

      const result = await createDocumentService(
        TEST_DOCUMENT_1.documentId,
        TEST_DOCUMENT_1.activityId as string,
        TEST_DOCUMENT_1.filename,
        TEST_DOCUMENT_1.mimeType,
        TEST_DOCUMENT_1.filesize
      );

      expect(mockRepos.document.create).toHaveBeenCalledTimes(1);
      expect(mockRepos.user.findById).not.toHaveBeenCalled();
      expect(result).toEqual(TEST_DOCUMENT_1);
    });

    it('omits createdByFullName when user not found (empty string is falsy)', async () => {
      const docWithCreatedBy = {
        ...TEST_DOCUMENT_1,
        createdBy: 'non-existent-user-id'
      };

      mockRepos.document.create.mockResolvedValue(docWithCreatedBy);
      mockRepos.user.findById.mockResolvedValue(null);

      const result = await createDocumentService(
        TEST_DOCUMENT_1.documentId,
        TEST_DOCUMENT_1.activityId as string,
        TEST_DOCUMENT_1.filename,
        TEST_DOCUMENT_1.mimeType,
        TEST_DOCUMENT_1.filesize
      );

      expect(result).toEqual(docWithCreatedBy);
    });
  });

  describe('deleteDocumentService', () => {
    it('calls document.delete with documentId', async () => {
      mockRepos.document.delete.mockResolvedValue(undefined as never);

      await deleteDocumentService(TEST_DOCUMENT_1.documentId);

      expect(mockRepos.document.delete).toHaveBeenCalledTimes(1);
      expect(mockRepos.document.delete).toHaveBeenCalledWith({ documentId: TEST_DOCUMENT_1.documentId });
    });
  });

  describe('listDocumentsService', () => {
    it('returns documents with createdByFullName populated from user lookup', async () => {
      const docWithUser: Document = {
        ...TEST_DOCUMENT_1,
        createdBy: TEST_IDIR_USER_1.userId
      };

      mockRepos.document.findMany.mockResolvedValue([docWithUser]);
      mockRepos.user.findById.mockResolvedValue(TEST_IDIR_USER_1);

      const result = await listDocumentsService(TEST_DOCUMENT_1.activityId as string);

      expect(mockRepos.document.findMany).toHaveBeenCalledTimes(1);
      expect(mockRepos.document.findMany).toHaveBeenCalledWith({
        where: { activityId: TEST_DOCUMENT_1.activityId },
        orderBy: { createdAt: 'asc' }
      });
      expect(mockRepos.user.findById).toHaveBeenCalledTimes(1);
      expect(result).toEqual([{ ...docWithUser, createdByFullName: TEST_IDIR_USER_1.fullName }]);
    });

    it('returns documents without user lookup when createdBy is null', async () => {
      mockRepos.document.findMany.mockResolvedValue([TEST_DOCUMENT_1]);

      const result = await listDocumentsService(TEST_DOCUMENT_1.activityId as string);

      expect(mockRepos.document.findMany).toHaveBeenCalledTimes(1);
      expect(mockRepos.user.findById).not.toHaveBeenCalled();
      expect(result).toEqual([TEST_DOCUMENT_1]);
    });

    it('returns empty array when no documents found', async () => {
      mockRepos.document.findMany.mockResolvedValue([]);

      const result = await listDocumentsService(TEST_DOCUMENT_1.activityId as string);

      expect(mockRepos.document.findMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it('handles multiple documents with mixed user data', async () => {
      const doc1 = { ...TEST_DOCUMENT_1, createdBy: TEST_IDIR_USER_1.userId };
      const doc2 = { ...TEST_DOCUMENT_1, documentId: 'doc-2', createdBy: null };
      const doc3 = {
        ...TEST_DOCUMENT_1,
        documentId: 'doc-3',
        createdBy: 'unknown-user-id'
      };

      mockRepos.document.findMany.mockResolvedValue([doc1, doc2, doc3]);
      mockRepos.user.findById
        .mockResolvedValueOnce(TEST_IDIR_USER_1) // for doc1
        .mockResolvedValueOnce(null); // for doc3

      const result = await listDocumentsService('ACTI1234');

      expect(result).toEqual([{ ...doc1, createdByFullName: TEST_IDIR_USER_1.fullName }, doc2, doc3]);
    });
  });
});
