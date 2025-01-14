import { emailService } from '../../../src/services/index.ts';

import { prismaMock } from '../../__mocks__/prismaMock.ts';

type Message = {
  msgId: string;
  to: Array<string>;
};

type EmailData = {
  messages: Array<Message>;
  txId: string;
};

const chesResponse: EmailData = {
  messages: [{ msgId: '9c50c187-4f89-463b-afea-ededc889dd31', to: [] }],
  txId: '508a1f8f-b5a1-4d37-a8c9-f7d7c0a86c00'
};

const recipientsDefault: Array<string> = ['test1@test.com', 'test2@test.com', 'test3@test.com', 'test4@test.com'];

describe('logEmail tests', () => {
  beforeEach(() => {
    prismaMock.$transaction.mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (callback: any) => callback(prismaMock)
    );
  });

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
        email_log_id: expect.any(String),
        msg_id: chesResponse.messages?.[0].msgId,
        to: x,
        tx_id: chesResponse.txId,
        http_status: 201
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
        email_log_id: expect.any(String),
        msg_id: chesResponse.messages?.[0].msgId,
        to: x,
        tx_id: chesResponse.txId,
        http_status: statusCode
      }))
    });
  });
});
