import axios from 'axios';

import * as comsService from '../../../src/external/coms.ts';
import { Action, GroupName } from '../../../src/utils/enums/application.ts';
import { Problem } from '../../../src/utils/index.ts';

import type { CurrentContext, Group } from '../../../src/types/index.ts';

vi.mock('config', async () => {
  const actual = await vi.importActual<{ get: (k: string) => unknown; has: (k: string) => boolean }>('config');
  return {
    default: {
      ...actual,
      get: vi.fn((key: string) => {
        switch (key) {
          case 'server.objectStorage.accessKeyId':
            return 'AK';
          case 'server.objectStorage.secretAccessKey':
            return 'SAK';
          case 'server.objectStorage.bucket':
            return 'bucket';
          case 'server.objectStorage.endpoint':
            return 'endpoint';
          case 'server.objectStorage.key':
            return 'key';
          case 'frontend.coms.apiPath':
            return 'http://coms';
          default:
            return actual.get(key);
        }
      }),
      has: vi.fn(() => false)
    }
  };
});

vi.mock('axios');

const mockedAxios = vi.mocked(axios);

const mockedAxiosInstance = {
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn()
};

describe('coms external service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAxios.create.mockReturnValue(mockedAxiosInstance as never);
  });

  describe('getBucket', () => {
    it('calls PUT /bucket and returns result while injecting basic auth', async () => {
      mockedAxiosInstance.put.mockResolvedValueOnce({
        status: 200,
        headers: {},
        data: { bucketId: 'bucket-1' }
      });

      const response = await comsService.getBucket();

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'http://coms',
          headers: expect.objectContaining({
            Authorization: 'Basic QUs6U0FL',
            'x-amz-bucket': 'bucket',
            'x-amz-endpoint': 'endpoint'
          })
        })
      );

      expect(mockedAxiosInstance.put).toHaveBeenCalledWith('/bucket', {
        accessKeyId: 'AK',
        bucket: 'bucket',
        bucketName: 'PCNS',
        endpoint: 'endpoint',
        secretAccessKey: 'SAK',
        key: 'key'
      });

      expect(response).toStrictEqual({
        status: 200,
        headers: {},
        data: { bucketId: 'bucket-1' }
      });
    });
  });

  describe('getObject', () => {
    it('calls GET /object with correct parameters and returns result', async () => {
      mockedAxiosInstance.get.mockResolvedValueOnce({
        status: 200,
        headers: {},
        data: { object: 'ABC' }
      });

      const response = await comsService.getObject('BEARER', '349c2d82-e33a-405a-b9c6-2454381f20ae');

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          responseType: 'arraybuffer',
          headers: { Authorization: 'Bearer BEARER' }
        })
      );

      expect(mockedAxiosInstance.get).toHaveBeenCalledWith('/object/349c2d82-e33a-405a-b9c6-2454381f20ae');

      expect(response).toStrictEqual({
        status: 200,
        headers: {},
        data: { object: 'ABC' }
      });
    });

    it('throws Problem 422 if objectId is invalid', async () => {
      await expect(comsService.getObject('BEARER', '1234')).rejects.toThrow(
        new Problem(422, { detail: 'Invalid objectId parameter' })
      );
    });
  });

  describe('searchObject', () => {
    it('calls GET /object with correct parameters and returns result', async () => {
      mockedAxiosInstance.get.mockResolvedValueOnce({
        status: 200,
        headers: {},
        data: { objectId: '349c2d82-e33a-405a-b9c6-2454381f20ae' }
      });

      const response = await comsService.searchObject('BEARER', '349c2d82-e33a-405a-b9c6-2454381f20ae');

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: { Authorization: 'Bearer BEARER' }
        })
      );

      expect(mockedAxiosInstance.get).toHaveBeenCalledWith('/object', {
        params: { objectId: '349c2d82-e33a-405a-b9c6-2454381f20ae' }
      });

      expect(response).toStrictEqual({
        status: 200,
        headers: {},
        data: { objectId: '349c2d82-e33a-405a-b9c6-2454381f20ae' }
      });
    });

    it('throws Problem 422 if objectId is invalid', async () => {
      await expect(comsService.searchObject('BEARER', '1234')).rejects.toThrow(
        new Problem(422, { detail: 'Invalid objectId parameter' })
      );
    });
  });

  describe('searchUser', () => {
    const context = { bearerToken: 'TOKEN' } as CurrentContext;

    it('calls GET /user with normalized username', async () => {
      mockedAxiosInstance.get.mockResolvedValueOnce({
        status: 200,
        headers: {},
        data: [{ userId: 'user-1' }]
      });

      const response = await comsService.searchUser(context, 'abc@azureidir');

      expect(mockedAxiosInstance.get).toHaveBeenCalledWith('/user', {
        params: { username: 'abc@azureidir' }
      });

      expect(response.data).toEqual([{ userId: 'user-1' }]);
    });

    it('maps axios errors to Problem', async () => {
      mockedAxiosInstance.get.mockRejectedValueOnce({
        response: {
          status: 404,
          data: { detail: 'Not Found' }
        }
      });
      mockedAxios.isAxiosError.mockReturnValueOnce(true);

      await expect(comsService.searchUser(context, 'unknown')).rejects.toThrow(
        new Problem(404, { detail: 'Not Found' }, { extra: { comsError: { detail: 'Not Found' } } })
      );
    });
  });

  describe('searchUserBucketPermissions', () => {
    const context = { bearerToken: 'TOKEN' } as CurrentContext;

    it('returns permissions as a Set and filters MANAGE', async () => {
      mockedAxiosInstance.get.mockResolvedValueOnce({
        status: 200,
        headers: {},
        data: [{ userId: 'user-1' }]
      });

      mockedAxiosInstance.put.mockResolvedValueOnce({
        status: 200,
        headers: {},
        data: { bucketId: 'bucket-1' }
      });

      mockedAxiosInstance.get.mockResolvedValueOnce({
        status: 200,
        headers: {},
        data: [
          {
            permissions: [
              { permCode: Action.READ },
              { permCode: Action.READ },
              { permCode: 'MANAGE' },
              { permCode: Action.CREATE }
            ]
          }
        ]
      });

      const response = await comsService.searchUserBucketPermissions(context, 'user@azureidir');

      expect(response.data).toEqual({
        userId: 'user-1',
        bucketId: 'bucket-1',
        perms: new Set([Action.READ, Action.CREATE])
      });
    });

    it('throws Problem 500 when userId is missing', async () => {
      mockedAxiosInstance.get.mockResolvedValueOnce({
        status: 200,
        headers: {},
        data: []
      });

      mockedAxiosInstance.put.mockResolvedValueOnce({
        status: 200,
        headers: {},
        data: { bucketId: 'bucket-1' }
      });

      await expect(comsService.searchUserBucketPermissions(context, 'user')).rejects.toThrow(
        new Problem(500, { detail: 'Unable to obtain userId or bucketId' })
      );
    });

    it('maps axios errors to Problem', async () => {
      mockedAxiosInstance.get.mockResolvedValueOnce({
        status: 200,
        headers: {},
        data: [{ userId: 'user-1' }]
      });

      mockedAxiosInstance.put.mockResolvedValueOnce({
        status: 200,
        headers: {},
        data: { bucketId: 'bucket-1' }
      });

      mockedAxiosInstance.get.mockRejectedValueOnce({
        response: {
          status: 404,
          data: { detail: 'Not Found' }
        }
      });
      mockedAxios.isAxiosError.mockReturnValueOnce(true);

      await expect(comsService.searchUserBucketPermissions(context, 'user')).rejects.toThrow(
        new Problem(404, { detail: 'Not Found' }, { extra: { comsError: { detail: 'Not Found' } } })
      );
    });
  });

  describe('assignPermissions', () => {
    const context = { bearerToken: 'TOKEN' } as CurrentContext;

    const mockSearchUserBucketPermissions = (perms: Action[]) => {
      mockedAxiosInstance.get.mockResolvedValueOnce({
        status: 200,
        headers: {},
        data: [{ userId: 'user-1' }]
      });

      mockedAxiosInstance.put.mockResolvedValueOnce({
        status: 200,
        headers: {},
        data: { bucketId: 'bucket-1' }
      });

      mockedAxiosInstance.get.mockResolvedValueOnce({
        status: 200,
        headers: {},
        data: [
          {
            permissions: perms.map((p) => ({ permCode: p }))
          }
        ]
      });
    };

    it('throws when sub is missing', async () => {
      await expect(comsService.assignPermissions(context, '', [])).rejects.toThrow(
        new Problem(403, { detail: 'No sub provided' })
      );
    });

    it('does nothing when permissions already match', async () => {
      const subjectGroups: Group[] = [{ name: GroupName.NAVIGATOR } as Group];
      mockSearchUserBucketPermissions([Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE]);

      await comsService.assignPermissions(context, 'sub', subjectGroups);

      expect(mockedAxiosInstance.delete).not.toHaveBeenCalled();
      expect(mockedAxiosInstance.put).not.toHaveBeenCalledWith(
        expect.stringMatching(/^\/permission\/bucket\//),
        expect.anything()
      );
    });

    it('removes permissions that are no longer required', async () => {
      const subjectGroups: Group[] = [{ name: GroupName.NAVIGATOR_READ_ONLY } as Group];
      mockSearchUserBucketPermissions([Action.READ, Action.UPDATE]);

      await comsService.assignPermissions(context, 'sub', subjectGroups);

      expect(mockedAxiosInstance.delete).toHaveBeenCalledWith('/permission/bucket/bucket-1', {
        params: {
          permCode: [Action.UPDATE],
          userId: 'user-1'
        }
      });
    });

    it('adds permissions that are missing', async () => {
      const subjectGroups: Group[] = [{ name: GroupName.NAVIGATOR } as Group];
      mockSearchUserBucketPermissions([Action.READ]);

      await comsService.assignPermissions(context, 'sub', subjectGroups);

      expect(mockedAxiosInstance.put).toHaveBeenCalledWith(
        '/permission/bucket/bucket-1',
        expect.arrayContaining([
          { permCode: Action.CREATE, userId: 'user-1' },
          { permCode: Action.UPDATE, userId: 'user-1' },
          { permCode: Action.DELETE, userId: 'user-1' }
        ])
      );
    });

    it('maps axios errors to Problem', async () => {
      const subjectGroups: Group[] = [{ name: GroupName.NAVIGATOR } as Group];
      mockSearchUserBucketPermissions([Action.READ]);

      mockedAxiosInstance.put.mockRejectedValueOnce({
        response: {
          status: 400,
          data: { detail: 'Bad Request' }
        }
      });
      mockedAxios.isAxiosError.mockReturnValueOnce(true);

      await expect(comsService.assignPermissions(context, 'sub', subjectGroups)).rejects.toThrow(
        new Problem(400, { detail: 'Bad Request' }, { extra: { comsError: { detail: 'Bad Request' } } })
      );
    });
  });
});
