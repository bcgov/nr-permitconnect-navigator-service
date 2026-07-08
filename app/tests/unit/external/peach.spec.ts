import axios from 'axios';

import { getPeachRecord } from '../../../src/external/peach.ts';
import Problem from '../../../src/utils/problem.ts';

import type { InternalAxiosRequestConfig } from 'axios';

vi.mock('config', async () => {
  const actual = await vi.importActual<{ get: (k: string) => unknown; has: (k: string) => boolean }>('config');
  return {
    default: {
      ...actual,
      get: vi.fn((key: string) => {
        switch (key) {
          case 'server.peach.tokenUrl':
            return 'https://mock.peach.token.url';
          case 'server.peach.clientId':
            return 'mock-client-id';
          case 'server.peach.clientSecret':
            return 'mock-client-secret';
          case 'server.peach.apiPath':
            return 'https://mock.peach.api.path';
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
  interceptors: {
    request: { use: vi.fn() }
  }
};

describe('peach external service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAxios.create.mockReturnValue(mockedAxiosInstance as never);
  });

  describe('peachAxios interceptor (getToken)', () => {
    it('fetches a token and appends it to the Authorization header', async () => {
      mockedAxiosInstance.get.mockResolvedValueOnce({ data: {} });
      await getPeachRecord('rec-1');

      const interceptorCallback = mockedAxiosInstance.interceptors.request.use.mock.calls[0][0];

      mockedAxios.mockResolvedValueOnce({
        data: { access_token: 'mock-auth-token' }
      } as never);

      const mockConfig = { headers: {} } as InternalAxiosRequestConfig;
      const resultConfig = await interceptorCallback(mockConfig);

      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'https://mock.peach.token.url',
          data: {
            grant_type: 'client_credentials',
            client_id: 'mock-client-id',
            client_secret: 'mock-client-secret'
          }
        })
      );
      expect(resultConfig.headers['Authorization']).toBe('Bearer mock-auth-token');
    });

    it('sets an empty Authorization header if token is null or missing', async () => {
      mockedAxiosInstance.get.mockResolvedValueOnce({ data: {} });
      await getPeachRecord('rec-1');

      const interceptorCallback = mockedAxiosInstance.interceptors.request.use.mock.calls[0][0];

      mockedAxios.mockResolvedValueOnce({
        data: { access_token: null }
      } as never);

      const mockConfig = { headers: {} } as InternalAxiosRequestConfig;
      const resultConfig = await interceptorCallback(mockConfig);

      expect(resultConfig.headers['Authorization']).toBe('');
    });
  });

  describe('getPeachRecord', () => {
    it('calls GET /records with record_id and system_id params and returns data', async () => {
      const expected = { record_id: 'rec-1', system_id: 'sys-1' };
      mockedAxiosInstance.get.mockResolvedValueOnce({ data: expected });

      const result = await getPeachRecord('rec-1', 'sys-1');

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://mock.peach.api.path',
          timeout: 10000
        })
      );

      expect(mockedAxiosInstance.get).toHaveBeenCalledWith('/records', {
        params: { record_id: 'rec-1', system_id: 'sys-1' }
      });
      expect(result).toStrictEqual(expected);
    });

    it('omits systemId by passing undefined when not provided', async () => {
      const expected = { record_id: 'rec-2' };
      mockedAxiosInstance.get.mockResolvedValueOnce({ data: expected });

      const result = await getPeachRecord('rec-2');

      expect(mockedAxiosInstance.get).toHaveBeenCalledWith('/records', {
        params: { record_id: 'rec-2', system_id: undefined }
      });
      expect(result).toStrictEqual(expected);
    });

    it('throws a Problem with the response status and detail when axios returns an AxiosError', async () => {
      const axiosErrorMock = {
        response: {
          status: 404,
          data: { detail: 'not found' }
        }
      };
      mockedAxiosInstance.get.mockRejectedValueOnce(axiosErrorMock);
      mockedAxios.isAxiosError.mockReturnValueOnce(true);

      await expect(getPeachRecord('rec-x')).rejects.toThrow(
        new Problem(404, { detail: 'not found' }, { extra: { peachError: { detail: 'not found' } } })
      );
    });

    it('throws a Problem with status 500 when AxiosError has no response', async () => {
      mockedAxiosInstance.get.mockRejectedValueOnce({});
      mockedAxios.isAxiosError.mockReturnValueOnce(true);

      await expect(getPeachRecord('rec-y')).rejects.toThrow(
        new Problem(500, { detail: undefined }, { extra: { peachError: undefined } })
      );
    });

    it('throws a generic 500 Problem when the error is not an AxiosError', async () => {
      mockedAxiosInstance.get.mockRejectedValueOnce(new Error('boom'));
      mockedAxios.isAxiosError.mockReturnValueOnce(false);

      await expect(getPeachRecord('rec-z')).rejects.toThrow(new Problem(500, { detail: 'Server Error' }));
    });
  });
});
