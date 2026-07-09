import axios from 'axios';

import * as ssoService from '../../../src/external/sso.ts';

import type { InternalAxiosRequestConfig } from 'axios';

vi.mock('config', async () => {
  const actual = await vi.importActual<{ get: (k: string) => unknown; has: (k: string) => boolean }>('config');
  return {
    default: {
      ...actual,
      get: vi.fn((key: string) => {
        switch (key) {
          case 'server.sso.tokenUrl':
            return 'https://mock.sso.token.url';
          case 'server.sso.clientId':
            return 'mock-client-id';
          case 'server.sso.clientSecret':
            return 'mock-client-secret';
          case 'server.sso.apiPath':
            return 'https://mock.sso.api.path';
          case 'server.env':
            return 'TEST';
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

const FAKE_PERSON = {
  firstName: 'Test',
  lastName: 'Person',
  email: 'test@test.com'
};

describe('sso external service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAxios.create.mockReturnValue(mockedAxiosInstance as never);
  });

  describe('ssoAxios interceptor (getToken)', () => {
    it('fetches a token and appends it to the Authorization header', async () => {
      mockedAxiosInstance.get.mockResolvedValueOnce({ data: { data: FAKE_PERSON }, status: 200 });
      await ssoService.searchIdirUsers();

      const interceptorCallback = mockedAxiosInstance.interceptors.request.use.mock.calls[0][0];

      mockedAxios.mockResolvedValueOnce({
        data: { access_token: 'mock-auth-token' }
      } as never);

      const mockConfig = { headers: {} } as InternalAxiosRequestConfig;
      const resultConfig = await interceptorCallback(mockConfig);

      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'https://mock.sso.token.url',
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
      mockedAxiosInstance.get.mockResolvedValueOnce({ data: { data: FAKE_PERSON }, status: 200 });
      await ssoService.searchIdirUsers();

      const interceptorCallback = mockedAxiosInstance.interceptors.request.use.mock.calls[0][0];

      mockedAxios.mockResolvedValueOnce({
        data: { access_token: null }
      } as never);

      const mockConfig = { headers: {} } as InternalAxiosRequestConfig;
      const resultConfig = await interceptorCallback(mockConfig);

      expect(resultConfig.headers['Authorization']).toBe('');
    });
  });

  describe('searchIdirUsers', () => {
    it('calls GET /${env}/azure-idir/users with correct params and returns result', async () => {
      mockedAxiosInstance.get.mockResolvedValueOnce({
        data: { data: FAKE_PERSON },
        status: 200
      });

      const response = await ssoService.searchIdirUsers(FAKE_PERSON as never);

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://mock.sso.api.path',
          timeout: 10000
        })
      );

      expect(mockedAxiosInstance.get).toHaveBeenCalledWith('/TEST/azure-idir/users', {
        params: FAKE_PERSON
      });

      expect(response).toStrictEqual({
        data: FAKE_PERSON,
        status: 200
      });
    });

    it('returns the parsed AxiosError payload if thrown', async () => {
      const axiosErrorMock = {
        response: { data: { message: 'Failed to search SSO' }, status: 400 }
      };
      mockedAxiosInstance.get.mockRejectedValueOnce(axiosErrorMock);
      mockedAxios.isAxiosError.mockReturnValueOnce(true);

      const response = await ssoService.searchIdirUsers(FAKE_PERSON as never);

      expect(response).toStrictEqual({ data: 'Failed to search SSO', status: 400 });
    });

    it('returns Error 500 if error is unknown', async () => {
      mockedAxiosInstance.get.mockRejectedValueOnce(new Error('Generic Error'));
      mockedAxios.isAxiosError.mockReturnValueOnce(false);

      const response = await ssoService.searchIdirUsers(FAKE_PERSON as never);

      expect(response).toStrictEqual({ data: 'Error', status: 500 });
    });
  });
});
