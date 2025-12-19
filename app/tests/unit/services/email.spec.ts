import axios from 'axios';
import config from 'config';

import { prismaMock } from '../../__mocks__/prismaMock.ts';
import * as emailService from '../../../src/services/email.ts';

import type { Email } from '../../../src/types/index.ts';

// Mock config library - @see {@link https://stackoverflow.com/a/64819698}
jest.mock('config');
let mockedConfig = config as jest.MockedObjectDeep<typeof config>;

jest.mock('axios');
let mockedAxios = axios as jest.MockedObjectDeep<typeof axios>;

type Message = {
  msgId: string;
  to: Array<string>;
};

type EmailData = {
  messages: Array<Message>;
  txId: string;
};

const postFakeEmail: Email = {
  to: ['to@test.com'],
  cc: ['cc@test.com'],
  bcc: ['bcc@test.com']
} as Email;

const chesResponse: EmailData = {
  messages: [{ msgId: '9c50c187-4f89-463b-afea-ededc889dd31', to: [] }],
  txId: '508a1f8f-b5a1-4d37-a8c9-f7d7c0a86c00'
};

const recipientsDefault: Array<string> = ['test1@test.com', 'test2@test.com', 'test3@test.com', 'test4@test.com'];

beforeEach(() => {
  mockedConfig = config as jest.MockedObjectDeep<typeof config>;
  mockedAxios = axios as jest.MockedObjectDeep<typeof axios>;

  // Replace any instances with the mocked instance
  mockedAxios.create.mockImplementation(() => mockedAxios);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockedAxios.interceptors.request.use.mockImplementation((cfg: any) => {
    return cfg;
  });

  prismaMock.$transaction.mockImplementationOnce(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (callback: any) => callback(prismaMock)
  );
});

describe('email', () => {
  const logEmailSpy = jest.spyOn(emailService, 'logEmail');

  it('calls POST /email with correct body and returns result', async () => {
    mockedConfig.get.mockImplementation(() => '');
    logEmailSpy.mockResolvedValueOnce({ count: 1 });
    mockedAxios.post.mockResolvedValueOnce({ data: chesResponse, status: 200 });

    const response = await emailService.email(postFakeEmail);

    expect(mockedAxios.post).toHaveBeenCalledWith('/email', postFakeEmail, {
      headers: {
        'Content-Type': 'application/json'
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    expect(response).toStrictEqual({ data: chesResponse, status: 200 });
  });
});

describe('logEmail', () => {
  it('should call $transaction and email_log.createMany once each', async () => {
    prismaMock.email_log.createMany.mockResolvedValueOnce({ count: recipientsDefault.length });

    await emailService.logEmail(chesResponse, recipientsDefault, 201);

    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.email_log.createMany).toHaveBeenCalledTimes(1);
  });

  it('should call the correct number of recipients', async () => {
    prismaMock.email_log.createMany.mockResolvedValueOnce({ count: recipientsDefault.length });
    const res = await emailService.logEmail(chesResponse, recipientsDefault, 201);
    expect(res).toEqual({ count: recipientsDefault.length });
  });

  it('should call createMany with the correct parameters', async () => {
    const recipients: Array<string> = ['test1@test.com', 'test2@test.com', 'test3@test.com', 'test3@test.com'];

    prismaMock.email_log.createMany.mockResolvedValueOnce({ count: recipients.length });
    await emailService.logEmail(chesResponse, recipients, 201);

    expect(prismaMock.email_log.createMany).toHaveBeenCalledWith({
      data: recipients.map((x) => ({
        emailLogId: expect.any(String),
        msgId: chesResponse.messages?.[0].msgId,
        to: x,
        txId: chesResponse.txId,
        httpStatus: 201
      }))
    });
  });

  it('should call createMany with the right http status code', async () => {
    const recipients: Array<string> = ['test1@test.com'];
    const statusCode: number = 451;

    prismaMock.email_log.createMany.mockResolvedValueOnce({ count: recipients.length });
    await emailService.logEmail(chesResponse, recipients, statusCode);

    expect(prismaMock.email_log.createMany).toHaveBeenCalledWith({
      data: recipients.map((x) => ({
        emailLogId: expect.any(String),
        msgId: chesResponse.messages?.[0].msgId,
        to: x,
        txId: chesResponse.txId,
        httpStatus: statusCode
      }))
    });
  });
});

describe('health', () => {
  it('calls GET /health and returns result', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: {}, status: 200 });
    const response = await emailService.health();

    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    expect(response).toStrictEqual({ data: {}, status: 200 });
  });
});
