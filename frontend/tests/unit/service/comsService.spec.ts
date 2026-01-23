import { comsService } from '@/services';
import { comsAxios } from '@/services/interceptors';

import type { AxiosInstance } from 'axios';

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

const PATH = 'object';
const deleteSpy = vi.fn();
const getSpy = vi.fn();
const putSpy = vi.fn();
const createObjectURLSpy = vi.spyOn(window.URL, 'createObjectURL');
const revokeObjectURLSpy = vi.spyOn(window.URL, 'revokeObjectURL');
const testObjectId = 'testObjectId';
const testFilename = 'testFilename';
const testVersionId = 'testObjectId';
const testData = 'testDatas';

vi.mock('@/services/interceptors');
vi.mocked(comsAxios).mockReturnValue({
  delete: deleteSpy,
  get: getSpy,
  put: putSpy
} as unknown as AxiosInstance);

beforeEach(() => {
  vi.clearAllMocks();
  createObjectURLSpy.mockImplementation(vi.fn());
  revokeObjectURLSpy.mockImplementation(vi.fn());
});

describe('comsService test', () => {
  describe('createObject tests', () => {
    const testObject = {
      name: 'testName',
      type: 'text/html'
    } as File;
    const testParams = {
      bucketId: 'testBucketId'
    };

    const testKeys = [
      {
        key: 'testKey1',
        value: 'testValue1'
      },
      {
        key: 'testKey2',
        value: 'testValue2'
      }
    ];

    it('creates an object', async () => {
      await comsService.createObject(testObject, {}, testParams);
      expect(putSpy).toBeCalledTimes(1);
      expect(putSpy).toBeCalledWith(PATH, testObject, expect.anything());
    });

    it('creates an object with metadata', async () => {
      const headers = {
        metadata: testKeys
      };
      const expectedConfig = {
        headers: {
          'Content-Disposition': `attachment; filename="${testObject.name}"`,
          'Content-Type': 'text/html',
          [testKeys[0]!.key]: testKeys[0]?.value,
          [testKeys[1]!.key]: testKeys[1]?.value
        },
        params: {
          bucketId: testParams.bucketId,
          tagset: {}
        }
      };

      await comsService.createObject(testObject, headers, testParams);
      expect(putSpy).toBeCalledTimes(1);
      expect(putSpy).toBeCalledWith(PATH, testObject, expectedConfig);
    });

    it('creates an object with tagsets', async () => {
      const headers = {};

      const newTestParams = {
        ...testParams,
        tagset: testKeys
      };
      const expectedConfig = {
        headers: {
          'Content-Disposition': `attachment; filename="${testObject.name}"`,
          'Content-Type': 'text/html'
        },
        params: {
          bucketId: testParams.bucketId,
          tagset: {
            [testKeys[0]!.key]: testKeys[0]?.value,
            [testKeys[1]!.key]: testKeys[1]?.value
          }
        }
      };

      await comsService.createObject(testObject, headers, newTestParams);
      expect(putSpy).toBeCalledTimes(1);
      expect(putSpy).toBeCalledWith(PATH, testObject, expectedConfig);
    });
  });

  it('deletes an object with versionId', async () => {
    await comsService.deleteObject(testObjectId, testVersionId);

    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(`${PATH}/${testObjectId}`, {
      params: {
        versionId: testVersionId
      }
    });
  });

  it('deletes an object without versionId', async () => {
    await comsService.deleteObject(testObjectId);

    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(`${PATH}/${testObjectId}`, {
      params: {
        versionId: undefined
      }
    });
  });

  it('gets an object with versionId', async () => {
    const comsSpy = vi.mocked(comsAxios().get).mockReturnValue(Promise.resolve({ data: testData }));
    await comsService.getObject(testObjectId, testFilename, testVersionId);

    expect(createObjectURLSpy).toBeCalledTimes(1);
    expect(revokeObjectURLSpy).toBeCalledTimes(1);
    expect(comsSpy).toBeCalledTimes(1);
    expect(comsSpy).toHaveBeenCalledWith(`${PATH}/${testObjectId}`, {
      params: {
        versionId: testVersionId,
        download: 'proxy'
      }
    });
  });

  it('gets an object without versionId', async () => {
    const comsSpy = vi.mocked(comsAxios().get).mockReturnValue(Promise.resolve({ data: testData }));
    await comsService.getObject(testObjectId, testFilename);

    expect(createObjectURLSpy).toBeCalledTimes(1);
    expect(revokeObjectURLSpy).toBeCalledTimes(1);
    expect(comsSpy).toBeCalledTimes(1);
    expect(comsSpy).toHaveBeenCalledWith(`${PATH}/${testObjectId}`, {
      params: {
        versionId: undefined,
        download: 'proxy'
      }
    });
  });
});
