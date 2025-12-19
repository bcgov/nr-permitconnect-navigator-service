import axios from 'axios';
import config from 'config';

import * as comsService from '../../../src/services/coms.ts';
import { Action } from '../../../src/utils/enums/application.ts';

// Mock config library - @see {@link https://stackoverflow.com/a/64819698}
jest.mock('config');
let mockedConfig = config as jest.MockedObjectDeep<typeof config>;

jest.mock('axios');
let mockedAxios = axios as jest.MockedObjectDeep<typeof axios>;

beforeEach(() => {
  mockedConfig = config as jest.MockedObjectDeep<typeof config>;
  mockedAxios = axios as jest.MockedObjectDeep<typeof axios>;

  // Replace any instances with the mocked instance
  mockedAxios.create.mockImplementation(() => mockedAxios);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockedAxios.interceptors.request.use.mockImplementation((cfg: any) => {
    return cfg;
  });
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('createBucket', () => {
  it('calls POST /bucket with correct body and returns result', async () => {
    mockedConfig.get.mockImplementation(() => '');
    mockedAxios.put.mockResolvedValueOnce({ data: { object: 'ABC' } });
    const response = await comsService.createBucket('BEARER', [Action.CREATE]);

    expect(mockedAxios.put).toHaveBeenCalledWith('/bucket', {
      accessKeyId: expect.any(String),
      bucket: expect.any(String),
      bucketName: 'PCNS',
      endpoint: expect.any(String),
      secretAccessKey: expect.any(String),
      key: expect.any(String),
      permCodes: [Action.CREATE]
    });
    expect(response).toStrictEqual({ object: 'ABC' });
  });
});

describe('getObject', () => {
  it('calls GET /object with correct parameters and returns result', async () => {
    mockedAxios.get.mockResolvedValueOnce({ status: 200, headers: '', data: { object: 'ABC' } });
    const response = await comsService.getObject('BEARER', '349c2d82-e33a-405a-b9c6-2454381f20ae');

    expect(mockedAxios.get).toHaveBeenCalledWith('/object/349c2d82-e33a-405a-b9c6-2454381f20ae');
    expect(response).toStrictEqual({ status: 200, headers: '', data: { object: 'ABC' } });
  });

  it('throws Problem 422 if objectId is invalid', async () => {
    await expect(comsService.getObject('BEARER', '1234')).rejects.toMatchObject({
      status: 422,
      detail: 'Invalid objectId parameter'
    });
  });
});
