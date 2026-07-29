import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TEST_CURRENT_CONTEXT } from '../data/index.ts';
import { createAtsClient, createAtsEnquiry, searchAtsUsers } from '../../../src/external/ats.ts';
import * as utils from '../../../src/utils/utils.ts';

import type { InternalAxiosRequestConfig } from 'axios';

vi.mock('config', async () => {
  const actual = await vi.importActual<{ get: (k: string) => unknown; has: (k: string) => boolean }>('config');
  return {
    default: {
      ...actual,
      get: vi.fn((key: string) => {
        if (key === 'server.ats.tokenUrl') return 'https://mock.ats.token.url';
        if (key === 'server.ats.clientId') return 'mock-client-id';
        if (key === 'server.ats.clientSecret') return 'mock-client-secret';
        if (key === 'server.ats.apiPath') return 'https://mock.ats.api.path';
        return actual.get(key);
      }),
      has: vi.fn(() => false)
    }
  };
});

vi.mock('axios');

const mockedAxios = vi.mocked(axios);

const mockedAxiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
  interceptors: {
    request: { use: vi.fn() }
  }
};

describe('ats external service', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedAxios.create.mockReturnValue(mockedAxiosInstance as never);
  });

  describe('atsAxios interceptor (getToken)', () => {
    it('fetches a token and appends it to the Authorization header', async () => {
      mockedAxiosInstance.get.mockResolvedValueOnce({ data: 1, status: 200 });

      await searchAtsUsers();

      const interceptorCallback = mockedAxiosInstance.interceptors.request.use.mock.calls[0][0];

      mockedAxios.mockResolvedValueOnce({
        data: { access_token: 'mock-auth-token' }
      } as never);

      const mockConfig = { headers: {} } as InternalAxiosRequestConfig;
      const resultConfig = await interceptorCallback(mockConfig);

      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: 'https://mock.ats.token.url',
          auth: {
            username: 'mock-client-id',
            password: 'mock-client-secret'
          }
        })
      );
      expect(resultConfig.headers.Authorization).toBe('Bearer mock-auth-token');
    });

    it('sets an empty Authorization header if token is null or missing', async () => {
      mockedAxiosInstance.get.mockResolvedValueOnce({ data: 1, status: 200 });

      await searchAtsUsers();

      const interceptorCallback = mockedAxiosInstance.interceptors.request.use.mock.calls[0][0];

      mockedAxios.mockResolvedValueOnce({
        data: { access_token: null }
      } as never);

      const mockConfig = { headers: {} } as InternalAxiosRequestConfig;
      const resultConfig = await interceptorCallback(mockConfig);

      expect(resultConfig.headers.Authorization).toBe('');
    });
  });

  describe('searchAtsUsers', () => {
    it('calls GET /clients and returns result with no params', async () => {
      mockedAxiosInstance.get.mockResolvedValueOnce({ data: 1, status: 200 });

      const response = await searchAtsUsers();

      expect(mockedAxiosInstance.get).toHaveBeenCalledWith('/clients', { params: undefined });
      expect(response).toStrictEqual({ data: 1, status: 200 });
    });

    it('passes the parameters correctly', async () => {
      mockedAxiosInstance.get.mockResolvedValueOnce({ data: 1, status: 200 });

      const response = await searchAtsUsers({ firstName: 'A', lastName: 'B' });

      expect(mockedAxiosInstance.get).toHaveBeenCalledWith('/clients', {
        params: { firstName: 'A', lastName: 'B' }
      });
      expect(response).toStrictEqual({ data: 1, status: 200 });
    });

    it('returns the parsed AxiosError payload if thrown', async () => {
      const axiosErrorMock = {
        response: { data: { message: 'Axios rejection' }, status: 502 }
      };
      mockedAxiosInstance.get.mockRejectedValueOnce(axiosErrorMock);
      mockedAxios.isAxiosError.mockReturnValueOnce(true);

      const response = await searchAtsUsers({ firstName: 'A', lastName: 'B' });

      expect(response).toStrictEqual({ data: 'Axios rejection', status: 502 });
    });

    it('returns Error 500 if error is unknown', async () => {
      mockedAxiosInstance.get.mockRejectedValueOnce(new Error('Generic Error'));
      mockedAxios.isAxiosError.mockReturnValueOnce(false);

      const response = await searchAtsUsers({ firstName: 'A', lastName: 'B' });

      expect(response).toStrictEqual({ data: 'Error', status: 500 });
    });
  });

  describe('createAtsClient', () => {
    it('calls POST /clients formatting the createdBy field correctly', async () => {
      mockedAxiosInstance.post.mockResolvedValueOnce({ data: 1, status: 201 });
      vi.spyOn(utils, 'getCurrentUsername').mockReturnValue('johndoe');

      const clientData: Record<string, unknown> = { firstName: 'John', surName: 'Doe' };

      const context = {
        ...TEST_CURRENT_CONTEXT,
        tokenPayload: { identity_provider: 'idir' }
      } as never;

      const response = await createAtsClient(clientData as never, context);

      expect(utils.getCurrentUsername).toHaveBeenCalledWith(context);
      expect(mockedAxiosInstance.post).toHaveBeenCalledWith(
        '/clients',
        expect.objectContaining({
          firstName: 'John',
          surName: 'Doe',
          createdBy: 'IDIR\\johndoe'
        })
      );
      expect(response).toStrictEqual({ data: 1, status: 201 });
    });

    it('returns the parsed AxiosError payload if thrown', async () => {
      const axiosErrorMock = {
        response: { data: { message: 'Failed to create client' }, status: 400 }
      };
      mockedAxiosInstance.post.mockRejectedValueOnce(axiosErrorMock);
      mockedAxios.isAxiosError.mockReturnValueOnce(true);

      const context = { ...TEST_CURRENT_CONTEXT } as never;
      const response = await createAtsClient({} as never, context);

      expect(response).toStrictEqual({ data: 'Failed to create client', status: 400 });
    });

    it('returns Error 500 if error is unknown', async () => {
      mockedAxiosInstance.post.mockRejectedValueOnce(new Error('Generic Error'));
      mockedAxios.isAxiosError.mockReturnValueOnce(false);

      const context = { ...TEST_CURRENT_CONTEXT } as never;
      const response = await createAtsClient({} as never, context);

      expect(response).toStrictEqual({ data: 'Error', status: 500 });
    });
  });

  describe('createAtsEnquiry', () => {
    it('calls POST /enquiries formatting the createdBy field correctly', async () => {
      mockedAxiosInstance.post.mockResolvedValueOnce({ data: 1, status: 201 });
      vi.spyOn(utils, 'getCurrentUsername').mockReturnValue('johndoe');

      const enquiryData: Record<string, unknown> = { clientId: 123 };
      const context = {
        ...TEST_CURRENT_CONTEXT,
        tokenPayload: { identity_provider: 'bceid' }
      } as never;

      const response = await createAtsEnquiry(enquiryData as never, context);

      expect(utils.getCurrentUsername).toHaveBeenCalledWith(context);
      expect(mockedAxiosInstance.post).toHaveBeenCalledWith(
        '/enquiries',
        expect.objectContaining({
          clientId: 123,
          createdBy: 'BCEID\\johndoe'
        })
      );
      expect(response).toStrictEqual({ data: 1, status: 201 });
    });

    it('returns the parsed AxiosError payload if thrown', async () => {
      const axiosErrorMock = {
        response: { data: { message: 'Failed to create enquiry' }, status: 400 }
      };
      mockedAxiosInstance.post.mockRejectedValueOnce(axiosErrorMock);
      mockedAxios.isAxiosError.mockReturnValueOnce(true);

      const context = { ...TEST_CURRENT_CONTEXT } as never;
      const response = await createAtsEnquiry({} as never, context);

      expect(response).toStrictEqual({ data: 'Failed to create enquiry', status: 400 });
    });

    it('returns Error 500 if error is unknown', async () => {
      mockedAxiosInstance.post.mockRejectedValueOnce(new Error('Generic Error'));
      mockedAxios.isAxiosError.mockReturnValueOnce(false);

      const context = { ...TEST_CURRENT_CONTEXT } as never;
      const response = await createAtsEnquiry({} as never, context);

      expect(response).toStrictEqual({ data: 'Error', status: 500 });
    });
  });
});
