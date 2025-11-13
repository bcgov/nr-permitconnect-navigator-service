import { TEST_PEACH_RECORD_1 } from '../data';
import { prismaTxMock } from '../../__mocks__/prismaMock';
import { getPeachRecordController } from '../../../src/controllers/peach';
import * as peachService from '../../../src/services/peach';
import * as txWrapper from '../../../src/db/utils/transactionWrapper';

import type { Request, Response } from 'express';

jest.mock('config');

jest.mock('../../../src/components/log', () => ({
  getLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    log: jest.fn()
  })
}));

jest.spyOn(txWrapper, 'transactionWrapper').mockImplementation(async (fn) => fn(prismaTxMock));

const mockResponse = () => {
  const res: { status?: jest.Mock; json?: jest.Mock; end?: jest.Mock } = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};

let res: { status?: jest.Mock; json?: jest.Mock; end?: jest.Mock };

beforeEach(() => {
  res = mockResponse();
  jest.clearAllMocks();
});

describe('getPeachRecordController', () => {
  const getPeachRecordSpy = jest.spyOn(peachService, 'getPeachRecord');

  it('should call service and respond with 200 and result', async () => {
    const req = {
      params: {
        recordId: TEST_PEACH_RECORD_1.record_id,
        systemId: TEST_PEACH_RECORD_1.system_id
      }
    };

    getPeachRecordSpy.mockResolvedValue(TEST_PEACH_RECORD_1);

    await getPeachRecordController(
      req as unknown as Request<{ recordId: string; systemId: string }>,
      res as unknown as Response
    );

    expect(getPeachRecordSpy).toHaveBeenCalledTimes(1);
    expect(getPeachRecordSpy).toHaveBeenCalledWith(TEST_PEACH_RECORD_1.record_id, TEST_PEACH_RECORD_1.system_id);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_PEACH_RECORD_1);
  });
});
