import axios, { AxiosResponse } from 'axios';
import config from 'config';

import * as comsService from '../../../src/services/coms.ts';
import * as yarsService from '../../../src/services/yars.ts';

import { Action, GroupName } from '../../../src/utils/enums/application.ts';
import { CurrentContext, Group } from '../../../src/types/stuff';
import { prismaTxMock } from '../../__mocks__/prismaMock.ts';

// Mock config library
jest.mock('config');
jest.mock('axios');
jest.mock('../../../src/services/yars.ts');

let mockedAxios = axios as jest.MockedObjectDeep<typeof axios>;
const mockedConfig = config as jest.Mocked<typeof config>;
const mockedGetSubjectGroups = jest.mocked(yarsService.getSubjectGroups);

beforeEach(() => {
  mockedAxios = axios as jest.MockedObjectDeep<typeof axios>;

  mockedAxios.create.mockImplementation(() => mockedAxios);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockedAxios.interceptors.request.use.mockImplementation((cfg: any) => cfg);

  mockedConfig.get.mockImplementation((key: string) => {
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
        return '';
    }
  });
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('getObject', () => {
  it('calls GET /object with correct parameters and returns result', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      status: 200,
      headers: '',
      data: { object: 'ABC' }
    });

    const response = await comsService.getObject('BEARER', '349c2d82-e33a-405a-b9c6-2454381f20ae');

    expect(mockedAxios.get).toHaveBeenCalledWith('/object/349c2d82-e33a-405a-b9c6-2454381f20ae');

    expect(response).toStrictEqual({
      status: 200,
      headers: '',
      data: { object: 'ABC' }
    });
  });

  it('throws Problem 422 if objectId is invalid', async () => {
    await expect(comsService.getObject('BEARER', '1234')).rejects.toMatchObject({
      status: 422,
      detail: 'Invalid objectId parameter'
    });
  });
});

describe('getBucket', () => {
  it('calls PUT /bucket and returns result', async () => {
    mockedAxios.put.mockResolvedValueOnce({
      status: 200,
      headers: {},
      data: { bucketId: 'bucket-1' }
    });

    const response = await comsService.getBucket();

    expect(mockedAxios.put).toHaveBeenCalledWith('/bucket', {
      accessKeyId: 'AK',
      bucket: 'bucket',
      bucketName: 'PCNS',
      endpoint: 'endpoint',
      secretAccessKey: 'SAK',
      key: 'key'
    });

    expect(response).toEqual({
      status: 200,
      headers: {},
      data: { bucketId: 'bucket-1' }
    });
  });
});

describe('searchUser', () => {
  it('calls GET /user with normalized username', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      status: 200,
      headers: {},
      data: [{ userId: 'user-1' }]
    });

    const response = await comsService.searchUser({ bearerToken: 'TOKEN' } as CurrentContext, 'abc@azureidir');

    expect(mockedAxios.get).toHaveBeenCalledWith('/user', {
      params: {
        username: 'abc@idir'
      }
    });

    expect(response.data).toEqual([{ userId: 'user-1' }]);
  });
});

describe('searchUserBucketPermissions', () => {
  it('returns permissions as a Set and filters MANAGE', async () => {
    mockedAxios.get
      .mockResolvedValueOnce({
        status: 200,
        headers: {},
        data: [{ userId: 'user-1' }]
      })
      .mockResolvedValueOnce({
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

    mockedAxios.put.mockResolvedValueOnce({
      status: 200,
      headers: {},
      data: {
        bucketId: 'bucket-1'
      }
    });

    const response = await comsService.searchUserBucketPermissions(
      { bearerToken: 'TOKEN' } as CurrentContext,
      'user@idir'
    );

    expect(response.data).toEqual({
      userId: 'user-1',
      bucketId: 'bucket-1',
      perms: new Set([Action.READ, Action.CREATE])
    });
  });

  it('throws Problem 500 when userId is missing', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      status: 200,
      headers: {},
      data: []
    });

    mockedAxios.put.mockResolvedValueOnce({
      status: 200,
      headers: {},
      data: {
        bucketId: 'bucket-1'
      }
    });

    await expect(
      comsService.searchUserBucketPermissions({ bearerToken: 'TOKEN' } as CurrentContext, 'user')
    ).rejects.toMatchObject({
      status: 500
    });
  });

  it('maps axios errors to Problem', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      status: 200,
      headers: {},
      data: [{ userId: 'user-1' }]
    });

    mockedAxios.put.mockResolvedValueOnce({
      status: 200,
      headers: {},
      data: {
        bucketId: 'bucket-1'
      }
    });

    mockedAxios.get.mockRejectedValueOnce({
      response: {
        status: 404,
        data: {
          detail: 'Not Found'
        }
      }
    });

    mockedAxios.isAxiosError.mockReturnValue(true);

    await expect(
      comsService.searchUserBucketPermissions({ bearerToken: 'TOKEN' } as CurrentContext, 'user')
    ).rejects.toMatchObject({
      status: 404,
      detail: 'Not Found'
    });
  });
});

describe('assignPermissions', () => {
  it('throws when sub is missing', async () => {
    await expect(
      comsService.assignPermissions(prismaTxMock, { bearerToken: 'TOKEN' } as CurrentContext, '')
    ).rejects.toMatchObject({
      status: 403,
      detail: 'No sub provided'
    });
  });

  it('does nothing when permissions already match', async () => {
    mockedGetSubjectGroups.mockResolvedValue([{ name: GroupName.NAVIGATOR }] as Group[]);

    jest.spyOn(comsService, 'searchUserBucketPermissions').mockResolvedValue({
      data: {
        userId: 'user-1',
        bucketId: 'bucket-1',
        perms: new Set([Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE])
      }
    } as AxiosResponse);

    await comsService.assignPermissions(prismaTxMock, { bearerToken: 'TOKEN' } as CurrentContext, 'sub');

    expect(mockedAxios.delete).not.toHaveBeenCalled();
    expect(mockedAxios.put).not.toHaveBeenCalled();
  });

  it('removes permissions that are no longer required', async () => {
    mockedGetSubjectGroups.mockResolvedValue([{ name: GroupName.NAVIGATOR_READ_ONLY }] as Group[]);

    jest.spyOn(comsService, 'searchUserBucketPermissions').mockResolvedValue({
      data: {
        userId: 'user-1',
        bucketId: 'bucket-1',
        perms: new Set([Action.READ, Action.UPDATE])
      }
    } as AxiosResponse);

    await comsService.assignPermissions(prismaTxMock, { bearerToken: 'TOKEN' } as CurrentContext, 'sub');

    expect(mockedAxios.delete).toHaveBeenCalledWith('/permission/bucket/bucket-1', {
      params: {
        permCode: [Action.UPDATE],
        userId: 'user-1'
      }
    });
  });

  it('adds permissions that are missing', async () => {
    mockedGetSubjectGroups.mockResolvedValue([{ name: GroupName.NAVIGATOR }] as Group[]);

    jest.spyOn(comsService, 'searchUserBucketPermissions').mockResolvedValue({
      data: {
        userId: 'user-1',
        bucketId: 'bucket-1',
        perms: new Set([Action.READ])
      }
    } as AxiosResponse);

    await comsService.assignPermissions(prismaTxMock, { bearerToken: 'TOKEN' } as CurrentContext, 'sub');

    expect(mockedAxios.put).toHaveBeenCalledWith(
      '/permission/bucket/bucket-1',
      expect.arrayContaining([
        {
          permCode: Action.CREATE,
          userId: 'user-1'
        },
        {
          permCode: Action.UPDATE,
          userId: 'user-1'
        },
        {
          permCode: Action.DELETE,
          userId: 'user-1'
        }
      ])
    );
  });
});
