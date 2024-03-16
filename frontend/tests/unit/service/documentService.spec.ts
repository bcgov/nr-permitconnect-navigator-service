import { comsService, documentService } from '@/services';
import { appAxios } from '@/services/interceptors';

import type { AxiosResponse } from 'axios';

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

const PATH = '/document';
const deleteSpy = vi.fn();
const getSpy = vi.fn();
const putSpy = vi.fn();

const mockTruncatedId = '01010101';
const mockedUuid = `${mockTruncatedId}-0000-0000-0000-000000000000`;
vi.mock('uuid', () => ({
  v4: () => mockedUuid,
  NIL: () => '00000000-0000-0000-0000-000000000000'
}));

vi.mock('@/services/interceptors');
vi.mocked(appAxios).mockReturnValue({
  delete: deleteSpy,
  get: getSpy,
  put: putSpy
} as any);

const comsCreateSpy = vi.spyOn(comsService, 'createObject');
const comsDeleteSpy = vi.spyOn(comsService, 'deleteObject');
const comsGetSpy = vi.spyOn(comsService, 'getObject');
const fileSpy = vi.spyOn(global, 'File');

// createDocument test data
const testActivityId = 'testActivityId';
const testBucketId = 'testBucketId';
const FILE_NAME = 'fileName';
const testFileData = {
  id: 'fileId',
  name: `${FILE_NAME}.txt`,
  mimeType: 'text/html',
  length: 42
};
const testFile1 = {
  name: testFileData.name,
  type: testFileData.mimeType
};
const modifiedFileName = `${FILE_NAME}_${mockTruncatedId}.txt`;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('noteService test', () => {
  describe('createDocument tests', () => {
    it('formats document name', async () => {
      // Test data
      comsCreateSpy.mockResolvedValue({
        data: testFileData
      } as AxiosResponse);
      fileSpy.mockReturnValue(testFile1 as File);

      // Testing
      await documentService.createDocument(testFile1 as File, testActivityId, testBucketId);

      expect(fileSpy).toHaveBeenCalledWith([testFile1], modifiedFileName, { type: testFileData.mimeType });
    });

    it('calls comService with right arguments', async () => {
      // Test data
      comsCreateSpy.mockResolvedValue({
        data: testFileData
      } as AxiosResponse);
      fileSpy.mockReturnValue(testFile1 as File);

      // Testing
      await documentService.createDocument(testFile1 as File, testActivityId, testBucketId);

      expect(comsCreateSpy).toHaveBeenCalledWith(testFile1, {}, { bucketId: testBucketId }, { timeout: 0 });
    });

    it('logs uploaded document to DB with right arguments', async () => {
      // Test data
      comsCreateSpy.mockResolvedValue({
        data: testFileData
      } as AxiosResponse);
      fileSpy.mockReturnValue(testFile1 as File);

      // Testing
      await documentService.createDocument(testFile1 as File, testActivityId, testBucketId);

      expect(putSpy).toHaveBeenCalledWith(`${PATH}`, {
        activityId: testActivityId,
        documentId: testFileData.id,
        filename: testFileData.name,
        mimeType: testFileData.mimeType,
        length: testFileData.length
      });
    });

    it('deletes COMS object on appAxios error', async () => {
      // Test data
      const testVersionId = 'testVersionId';
      comsCreateSpy.mockResolvedValue({
        data: {
          id: testFileData.id,
          versionId: testVersionId
        }
      } as AxiosResponse);
      fileSpy.mockReturnValue(testFile1 as File);
      comsDeleteSpy.mockResolvedValue({} as AxiosResponse);

      vi.mocked(appAxios().put).mockImplementation(() => {
        throw new Error();
      });

      // Testing
      await documentService.createDocument(testFile1 as File, testActivityId, testBucketId);
      expect(comsDeleteSpy).toHaveBeenCalledWith(testFileData.id, testVersionId);
    });

    it('does not delete COMS object on comsService error', async () => {
      // Test data
      comsCreateSpy.mockImplementation(() => {
        throw new Error();
      });
      fileSpy.mockReturnValue(testFile1 as File);
      comsDeleteSpy.mockResolvedValue({} as AxiosResponse);

      // Testing
      await documentService.createDocument(testFile1 as File, testActivityId, testBucketId);
      expect(comsDeleteSpy).not.toHaveBeenCalled();
    });
  });

  it('downloads a document by id with no version', async () => {
    const testId = 'testDocumentId';
    comsGetSpy.mockResolvedValue();
    await documentService.downloadDocument(testId);

    expect(comsGetSpy).toHaveBeenCalledWith(testId, undefined);
  });

  it('downloads a document by id with version', async () => {
    const testId = 'testDocumentId';
    const versionId = 'testVersionId';
    comsGetSpy.mockResolvedValue();
    await documentService.downloadDocument(testId, versionId);

    expect(comsGetSpy).toHaveBeenCalledWith(testId, versionId);
  });

  it('deletes a document by id with no version', async () => {
    const testId = 'testDocumentId';
    comsDeleteSpy.mockResolvedValue({} as AxiosResponse);
    await documentService.deleteDocument(testId);

    expect(comsDeleteSpy).toHaveBeenCalledWith(testId, undefined);
    expect(deleteSpy).toHaveBeenCalledWith(`${PATH}/${testId}`, {
      params: {
        versionId: undefined
      }
    });
  });

  it('deletes a document by id with version', async () => {
    const testId = 'testdocumentId';
    const versionId = 'testVersionId';
    comsDeleteSpy.mockResolvedValue({} as AxiosResponse);
    await documentService.deleteDocument(testId, versionId);

    expect(comsDeleteSpy).toHaveBeenCalledWith(testId, versionId);
    expect(deleteSpy).toHaveBeenCalledWith(`${PATH}/${testId}`, {
      params: {
        versionId: versionId
      }
    });
  });

  it('gets a list of documents by id', async () => {
    const testId = 'testActivityId';
    await documentService.listDocuments(testId);

    expect(getSpy).toHaveBeenCalledWith(`${PATH}/list/${testId}`);
  });
});
