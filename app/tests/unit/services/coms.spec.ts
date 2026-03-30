import axios from 'axios';

import * as comsService from '../../../src/services/coms.ts';

// Mock config library - @see {@link https://stackoverflow.com/a/64819698}
jest.mock('config');
jest.mock('axios');
let mockedAxios = axios as jest.MockedObjectDeep<typeof axios>;

beforeEach(() => {
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
