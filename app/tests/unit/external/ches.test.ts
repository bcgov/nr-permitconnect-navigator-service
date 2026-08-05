import axios from 'axios';

import { prismaMock } from '../../__mocks__/prismaMock.ts';
import * as emailService from '../../../src/external/ches.ts';

import type { InternalAxiosRequestConfig } from 'axios';
import type { Email } from '../../../src/types/index.ts';

vi.mock('config', async () => {
  const actual = await vi.importActual<{ get: (k: string) => unknown; has: (k: string) => boolean }>('config');
  return {
    default: {
      ...actual,
      get: vi.fn((key: string) => {
        switch (key) {
          case 'server.ches.tokenUrl':
            return 'https://mock.ches.token.url';
          case 'server.ches.clientId':
            return 'mock-client-id';
          case 'server.ches.clientSecret':
            return 'mock-client-secret';
          case 'server.ches.apiPath':
            return 'https://mock.ches.api.path';
          default:
            return actual.get(key);
        }
      }),
      has: vi.fn(() => false)
    }
  };
});

// Explicitly wire the database mock to ensure prisma references align
vi.mock('../../../src/db/database.ts', async () => {
  const { prismaMock } = await vi.importActual<{ prismaMock: unknown }>('../../__mocks__/prismaMock.ts');
  return { default: prismaMock };
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

const chesResponse = {
  messages: [{ msgId: '9c50c187-4f89-463b-afea-ededc889dd31', to: [] }],
  txId: '508a1f8f-b5a1-4d37-a8c9-f7d7c0a86c00'
};

const recipientsDefault = ['test1@test.com', 'test2@test.com', 'test3@test.com', 'test4@test.com'];

describe('ches external service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAxios.create.mockReturnValue(mockedAxiosInstance as never);

    prismaMock.$transaction.mockImplementation(async (callback: (trx: typeof prismaMock) => unknown) => {
      return (await callback(prismaMock)) as never;
    });
  });

  describe('chesAxios interceptor (getToken)', () => {
    it('fetches a token and appends it to the Authorization header', async () => {
      mockedAxiosInstance.get.mockResolvedValueOnce({ data: {}, status: 200 });
      await emailService.health();

      const interceptorCallback = mockedAxiosInstance.interceptors.request.use.mock.calls[0][0];

      mockedAxios.mockResolvedValueOnce({
        data: { access_token: 'mock-auth-token' }
      } as never);

      const mockConfig = { headers: {} } as InternalAxiosRequestConfig;
      const resultConfig = await interceptorCallback(mockConfig);

      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'https://mock.ches.token.url',
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
      mockedAxiosInstance.get.mockResolvedValueOnce({ data: {}, status: 200 });
      await emailService.health();

      const interceptorCallback = mockedAxiosInstance.interceptors.request.use.mock.calls[0][0];

      mockedAxios.mockResolvedValueOnce({
        data: { access_token: null }
      } as never);

      const mockConfig = { headers: {} } as InternalAxiosRequestConfig;
      const resultConfig = await interceptorCallback(mockConfig);

      expect(resultConfig.headers['Authorization']).toBe('');
    });
  });

  describe('email', () => {
    // We cannot use vi.spyOn(emailService, 'logEmail') because ESM internal module function
    // calls do not go through the exported binding. Instead, we assert the side-effects directly on Prisma.

    const postFakeEmail: Email = {
      to: ['to@test.com', 'duplicate@test.com'],
      cc: ['cc@test.com', 'duplicate@test.com'],
      bcc: ['bcc@test.com'],
      from: 'from@test.com',
      subject: 'Test Subject',
      bodyType: 'text',
      body: 'Test Body'
    };

    const uniqueRecipients = ['to@test.com', 'duplicate@test.com', 'cc@test.com', 'bcc@test.com'];

    it('calls POST /email with correct body, deduplicates emails, and logs result', async () => {
      mockedAxiosInstance.post.mockResolvedValueOnce({ data: chesResponse, status: 200 });

      const response = await emailService.email(postFakeEmail);

      expect(mockedAxiosInstance.post).toHaveBeenCalledWith('/email', postFakeEmail, {
        headers: {
          'Content-Type': 'application/json'
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      expect(prismaMock.email_log.createMany).toHaveBeenCalledWith({
        data: uniqueRecipients.map((recipient) => ({
          emailLogId: expect.any(String),
          msgId: chesResponse.messages[0].msgId,
          to: recipient,
          txId: chesResponse.txId,
          httpStatus: 200
        }))
      });

      expect(response).toStrictEqual({ data: chesResponse, status: 200 });
    });

    it('handles AxiosErrors correctly and logs the error', async () => {
      const axiosErrorMock = {
        response: {
          data: { errors: [{ message: 'CHES validation failed' }] },
          status: 422
        }
      };
      mockedAxiosInstance.post.mockRejectedValueOnce(axiosErrorMock);
      mockedAxios.isAxiosError.mockReturnValueOnce(true);

      const response = await emailService.email(postFakeEmail);

      expect(prismaMock.email_log.createMany).toHaveBeenCalledWith({
        data: uniqueRecipients.map((recipient) => ({
          emailLogId: expect.any(String),
          msgId: undefined,
          to: recipient,
          txId: undefined,
          httpStatus: 422
        }))
      });

      expect(response).toStrictEqual({ data: 'CHES validation failed', status: 422 });
    });

    it('handles generic errors correctly and logs the error', async () => {
      mockedAxiosInstance.post.mockRejectedValueOnce(new Error('Network Error'));
      mockedAxios.isAxiosError.mockReturnValueOnce(false);

      const response = await emailService.email(postFakeEmail);

      expect(prismaMock.email_log.createMany).toHaveBeenCalledWith({
        data: uniqueRecipients.map((recipient) => ({
          emailLogId: expect.any(String),
          msgId: undefined,
          to: recipient,
          txId: undefined,
          httpStatus: 500
        }))
      });

      expect(response).toStrictEqual({ data: 'Email error', status: 500 });
    });
  });

  describe('logEmail', () => {
    it('should call $transaction and email_log.createMany with proper UUID and structure', async () => {
      prismaMock.email_log.createMany.mockResolvedValueOnce({ count: recipientsDefault.length });

      const res = await emailService.logEmail(chesResponse, recipientsDefault, 201);

      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
      expect(prismaMock.email_log.createMany).toHaveBeenCalledWith({
        data: recipientsDefault.map((recipient) => ({
          emailLogId: expect.any(String),
          msgId: '9c50c187-4f89-463b-afea-ededc889dd31',
          to: recipient,
          txId: '508a1f8f-b5a1-4d37-a8c9-f7d7c0a86c00',
          httpStatus: 201
        }))
      });
      expect(res).toEqual({ count: recipientsDefault.length });
    });

    it('should handle missing data properties safely during error logging', async () => {
      prismaMock.email_log.createMany.mockResolvedValueOnce({ count: 1 });

      await emailService.logEmail(null, ['test@test.com'], 500);

      expect(prismaMock.email_log.createMany).toHaveBeenCalledWith({
        data: [
          {
            emailLogId: expect.any(String),
            msgId: undefined,
            to: 'test@test.com',
            txId: undefined,
            httpStatus: 500
          }
        ]
      });
    });
  });

  describe('health', () => {
    it('calls GET /health and returns result', async () => {
      mockedAxiosInstance.get.mockResolvedValueOnce({ data: {}, status: 200 });

      const response = await emailService.health();

      expect(mockedAxiosInstance.get).toHaveBeenCalledWith('/health');
      expect(response).toStrictEqual({ data: {}, status: 200 });
    });
  });
});
