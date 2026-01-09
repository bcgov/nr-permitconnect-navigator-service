import axios, { AxiosError } from 'axios';
import config from 'config';

import * as atsService from '../../../src/services/ats.ts';

import type { InternalAxiosRequestConfig } from 'axios';
import type { ATSClientResource, ATSEnquiryResource } from '../../../src/types/index.ts';

// Mock config library - @see {@link https://stackoverflow.com/a/64819698}
jest.mock('config');
let mockedConfig = config as jest.MockedObjectDeep<typeof config>;

jest.mock('axios');
let mockedAxios = axios as jest.MockedObjectDeep<typeof axios>;

beforeEach(() => {
  mockedConfig = config as jest.MockedObjectDeep<typeof config>;
  mockedAxios = axios as jest.MockedObjectDeep<typeof axios>;

  // Replace any instances with the mocked instance (a new mock could be used here instead):
  mockedAxios.create.mockImplementation(() => mockedAxios);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockedAxios.interceptors.request.use.mockImplementation((cfg: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return cfg;
  });
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('searchATSUsers', () => {
  it('calls GET /clients and returns result', async () => {
    mockedConfig.get.mockImplementation(() => '');
    mockedAxios.get.mockResolvedValueOnce({ data: 1, status: 200 });
    const response = await atsService.searchATSUsers();

    expect(mockedAxios.get).toHaveBeenCalledWith('/clients', { params: undefined });
    expect(response).toStrictEqual({ data: 1, status: 200 });
  });

  it('passes the parameters', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: 1, status: 200 });
    const response = await atsService.searchATSUsers({ firstName: 'A', lastName: 'B' });

    expect(mockedAxios.get).toHaveBeenCalledWith('/clients', { params: { firstName: 'A', lastName: 'B' } });
    expect(response).toStrictEqual({ data: 1, status: 200 });
  });

  // catch doesn't seem to get the AxiosError
  it.skip('returns the AxiosError if thrown', async () => {
    mockedAxios.get.mockRejectedValueOnce(
      new AxiosError('AxiosError', 'ESOMETHING', undefined, undefined, {
        data: { message: 'AxiosError' },
        status: 500,
        statusText: 'AxiosError',
        headers: {},
        config: {} as InternalAxiosRequestConfig
      })
    );
    mockedAxios.isAxiosError.mockReturnValueOnce(true);

    const response = await atsService.searchATSUsers({ firstName: 'A', lastName: 'B' });

    expect(response).toStrictEqual({ data: 'AxiosError', status: 500 });
  });

  it('returns Error 500 if error is unknown', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error());
    mockedAxios.isAxiosError.mockReturnValueOnce(false);

    const response = await atsService.searchATSUsers({ firstName: 'A', lastName: 'B' });

    expect(response).toStrictEqual({ data: 'Error', status: 500 });
  });
});

describe('createATSClient', () => {
  it('calls POST /clients and returns result', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: 1, status: 200 });
    const response = await atsService.createATSClient({ firstName: 'A', surName: 'B' } as ATSClientResource);

    expect(mockedAxios.post).toHaveBeenCalledWith('/clients', { firstName: 'A', surName: 'B' });
    expect(response).toStrictEqual({ data: 1, status: 200 });
  });

  it('returns Error 500 if error is unknown', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error());
    mockedAxios.isAxiosError.mockReturnValueOnce(false);

    const response = await atsService.createATSClient({ firstName: 'A', surName: 'B' } as ATSClientResource);

    expect(response).toStrictEqual({ data: 'Error', status: 500 });
  });
});

describe('createATSEnquiry', () => {
  it('calls POST /enquiries and returns result', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: 1, status: 200 });
    const response = await atsService.createATSEnquiry({ clientId: 123 } as ATSEnquiryResource);

    expect(mockedAxios.post).toHaveBeenCalledWith('/enquiries', { clientId: 123 });
    expect(response).toStrictEqual({ data: 1, status: 200 });
  });

  it('returns Error 500 if error is unknown', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error());
    mockedAxios.isAxiosError.mockReturnValueOnce(false);

    const response = await atsService.createATSEnquiry({ clientId: 123 } as ATSEnquiryResource);

    expect(response).toStrictEqual({ data: 'Error', status: 500 });
  });
});
