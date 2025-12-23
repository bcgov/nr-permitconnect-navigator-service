import { createPinia, setActivePinia, type StoreGeneric } from 'pinia';

import { comsService, documentService } from '@/services';
import { appAxios } from '@/services/interceptors';
import { useAppStore } from '@/store';
import { Initiative } from '@/utils/enums/application';

import type { AxiosResponse } from 'axios';

// Constants
const PATH = 'document';

const mockTruncatedId = '01010101';
const mockedUuid = `${mockTruncatedId}-0000-0000-0000-000000000000`;

const testActivityId = 'testActivityId';
const testBucketId = 'testBucketId';
const testTagset = [{ key: 'Project ID', value: testActivityId }];
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

// Mocks
const deleteSpy = vi.fn();
const getSpy = vi.fn();
const postSpy = vi.fn();

vi.mock('uuid', () => ({
  v4: () => mockedUuid
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

vi.mock('@/services/interceptors');
vi.mocked(appAxios).mockReturnValue({
  delete: deleteSpy,
  get: getSpy,
  post: postSpy
} as any);

// Spies
const createObjectSpy = vi.spyOn(comsService, 'createObject');
const deleteObjectSpy = vi.spyOn(comsService, 'deleteObject');
const getObjectSpy = vi.spyOn(comsService, 'getObject');
let fileSpy = vi.spyOn(global, 'File');

// Tests
beforeEach(() => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
});

describe('documentService', () => {
  let appStore: StoreGeneric;

  beforeEach(() => {
    appStore = useAppStore();
  });

  describe.each([{ initiative: Initiative.ELECTRIFICATION }, { initiative: Initiative.HOUSING }])(
    '$initiative',
    ({ initiative }) => {
      beforeEach(() => {
        appStore.setInitiative(initiative);

        // Mock the global File constructor
        const FileMock = vi.fn(
          class {
            name = testFile1.name;
            type = testFile1.type;
          }
        );

        vi.stubGlobal('File', FileMock);

        fileSpy = vi.spyOn(global, 'File');
      });

      afterEach(() => {
        vi.unstubAllGlobals();
      });

      describe('createDocument', () => {
        it('formats document name', async () => {
          createObjectSpy.mockResolvedValue({
            data: testFileData
          } as AxiosResponse);

          await documentService.createDocument(testFile1 as File, testActivityId, testBucketId);
          expect(fileSpy).toHaveBeenCalledTimes(1);
          expect(fileSpy).toHaveBeenCalledWith([testFile1], modifiedFileName, { type: testFileData.mimeType });
        });

        it('calls comService with right arguments', async () => {
          createObjectSpy.mockResolvedValue({
            data: testFileData
          } as AxiosResponse);

          await documentService.createDocument(testFile1 as File, testActivityId, testBucketId);
          expect(createObjectSpy).toHaveBeenCalledTimes(1);
          expect(createObjectSpy).toHaveBeenCalledWith(
            testFile1,
            {},
            { bucketId: testBucketId, tagset: testTagset },
            { timeout: 0 }
          );
        });

        it('logs uploaded document to DB with right arguments', async () => {
          createObjectSpy.mockResolvedValue({
            data: testFileData
          } as AxiosResponse);

          await documentService.createDocument(testFile1 as File, testActivityId, testBucketId);
          expect(postSpy).toHaveBeenCalledTimes(1);
          expect(postSpy).toHaveBeenCalledWith(`${initiative.toLowerCase()}/${PATH}`, {
            activityId: testActivityId,
            documentId: testFileData.id,
            filename: testFileData.name,
            mimeType: testFileData.mimeType,
            filesize: testFileData.length
          });
        });

        // TODO: How to properly get mock functions inside catch blocks to do the right thing
        // Coverage shows they are executing but spys do not
        it('deletes COMS object on appAxios error', async () => {
          const testVersionId = 'testVersionId';
          createObjectSpy.mockResolvedValue({
            data: {
              id: testFileData.id,
              versionId: testVersionId
            }
          } as AxiosResponse);

          deleteObjectSpy.mockResolvedValue({} as AxiosResponse);

          vi.mocked(appAxios().post).mockImplementationOnce(() => {
            throw new Error();
          });

          await expect(
            async () => await documentService.createDocument(testFile1 as File, testActivityId, testBucketId)
          ).rejects.toThrow();
        });

        // Useless test until above can be fixed
        it.skip('does not delete COMS object on comsService error', async () => {
          createObjectSpy.mockImplementation(() => {
            throw new Error();
          });

          deleteObjectSpy.mockResolvedValue({} as AxiosResponse);

          expect(
            async () => await documentService.createDocument(testFile1 as File, testActivityId, testBucketId)
          ).rejects.toThrow();
        });
      });

      it('downloads a document by id with no version', async () => {
        const testId = 'testDocumentId';
        const filename = 'filename';
        getObjectSpy.mockResolvedValue();
        await documentService.downloadDocument(testId, filename);

        expect(getObjectSpy).toHaveBeenCalledTimes(1);
        expect(getObjectSpy).toHaveBeenCalledWith(testId, filename, undefined);
      });

      it('downloads a document by id with version', async () => {
        const testId = 'testDocumentId';
        const versionId = 'testVersionId';
        const filename = 'filename';
        getObjectSpy.mockResolvedValue();
        await documentService.downloadDocument(testId, filename, versionId);
        expect(getObjectSpy).toHaveBeenCalledTimes(1);
        expect(getObjectSpy).toHaveBeenCalledWith(testId, filename, versionId);
      });

      it('deletes a document by id with no version', async () => {
        const testId = 'testDocumentId';
        deleteObjectSpy.mockResolvedValue({} as AxiosResponse);
        await documentService.deleteDocument(testId);
        expect(deleteObjectSpy).toHaveBeenCalledTimes(1);
        expect(deleteObjectSpy).toHaveBeenCalledWith(testId, undefined);
        expect(deleteSpy).toHaveBeenCalledTimes(1);
        expect(deleteSpy).toHaveBeenCalledWith(`${initiative.toLowerCase()}/${PATH}/${testId}`, {
          params: {
            versionId: undefined
          }
        });
      });

      it('deletes a document by id with version', async () => {
        const testId = 'testdocumentId';
        const versionId = 'testVersionId';
        deleteObjectSpy.mockResolvedValue({} as AxiosResponse);
        await documentService.deleteDocument(testId, versionId);
        expect(deleteObjectSpy).toHaveBeenCalledTimes(1);
        expect(deleteObjectSpy).toHaveBeenCalledWith(testId, versionId);
        expect(deleteSpy).toHaveBeenCalledTimes(1);
        expect(deleteSpy).toHaveBeenCalledWith(`${initiative.toLowerCase()}/${PATH}/${testId}`, {
          params: {
            versionId: versionId
          }
        });
      });

      it('gets a list of documents by id', async () => {
        const testId = 'testActivityId';
        await documentService.listDocuments(testId);

        expect(getSpy).toHaveBeenCalledTimes(1);
        expect(getSpy).toHaveBeenCalledWith(`${initiative.toLowerCase()}/${PATH}/list/${testId}`);
      });
    }
  );
});
