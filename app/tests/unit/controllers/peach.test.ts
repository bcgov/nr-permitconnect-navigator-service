import {
  TEST_PERMIT_1,
  TEST_PERMIT_2,
  TEST_PERMIT_3,
  TEST_PERMIT_4,
  TEST_PEACH_RECORD_1,
  TEST_PEACH_RECORD_2
} from '../data';
import { prismaTxMock } from '../../__mocks__/prismaMock';
import { syncPeachRecords, getPeachRecordController } from '../../../src/controllers/peach';
import * as parser from '../../../src/parsers/peachParser';
import * as permitService from '../../../src/services/permit';
import * as peachService from '../../../src/services/peach';
import { PeachIntegratedSystem, PermitStage, PermitState } from '../../../src/utils/enums/permit';
import * as txWrapper from '../../../src/db/utils/transactionWrapper';
import * as stamps from '../../../src/db/utils/utils';

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

describe('syncPeachRecords', () => {
  const searchSpy = jest.spyOn(permitService, 'searchPermits');
  const upsertSpy = jest.spyOn(permitService, 'upsertPermit');
  const getRecSpy = jest.spyOn(peachService, 'getPeachRecord');
  const parseSpy = jest.spyOn(parser, 'parsePeachRecords');
  const stampsSpy = jest.spyOn(stamps, 'generateUpdateStamps');

  it('fetches from PEACH and upserts when differences are detected', async () => {
    searchSpy.mockResolvedValueOnce([TEST_PERMIT_1]);
    getRecSpy.mockResolvedValueOnce(TEST_PEACH_RECORD_1);

    const summary = {
      state: PermitState.IN_PROGRESS,
      stage: PermitStage.APPLICATION_SUBMISSION,
      submittedDate: new Date('2024-01-10T00:00:00.000Z'),
      adjudicationDate: undefined,
      statusLastChanged: new Date('2024-01-15T00:00:00.000Z')
    };

    parseSpy.mockReturnValueOnce({
      [`${PeachIntegratedSystem.VFCBC}REC-123`]: summary
    });

    const fixedNow = new Date('2024-02-01T12:00:00.000Z');
    stampsSpy.mockReturnValue({ updatedAt: fixedNow, updatedBy: 'user-abc' });

    await syncPeachRecords();

    expect(searchSpy).toHaveBeenCalledTimes(1);
    expect(searchSpy).toHaveBeenCalledWith(prismaTxMock, expect.objectContaining({ includePermitTracking: true }));

    expect(getRecSpy).toHaveBeenCalledTimes(1);
    expect(getRecSpy).toHaveBeenCalledWith('REC-123', PeachIntegratedSystem.VFCBC);

    expect(parseSpy).toHaveBeenCalledTimes(1);
    expect(parseSpy).toHaveBeenCalledWith([TEST_PEACH_RECORD_1]);

    expect(upsertSpy).toHaveBeenCalledTimes(1);
    expect(upsertSpy).toHaveBeenCalledWith(
      prismaTxMock,
      expect.objectContaining({
        permitId: TEST_PERMIT_1.permitId,
        state: PermitState.IN_PROGRESS,
        stage: PermitStage.APPLICATION_SUBMISSION,
        submittedDate: new Date('2024-01-10T00:00:00.000Z'),
        statusLastChanged: new Date('2024-01-15T00:00:00.000Z'),
        statusLastVerified: new Date('2024-01-15T00:00:00.000Z'),
        updatedAt: fixedNow,
        updatedBy: 'user-abc'
      })
    );
  });

  it('does not upsert when parsed values are equal (no diffs)', async () => {
    searchSpy.mockResolvedValueOnce([TEST_PERMIT_2]);
    getRecSpy.mockResolvedValueOnce(TEST_PEACH_RECORD_1);

    const sameDate = TEST_PERMIT_2.submittedDate!;
    parseSpy.mockReturnValueOnce({
      [`${PeachIntegratedSystem.VFCBC}REC-XYZ`]: {
        state: TEST_PERMIT_2.state,
        stage: TEST_PERMIT_2.stage,
        submittedDate: sameDate,
        adjudicationDate: undefined,
        statusLastChanged: TEST_PERMIT_2.statusLastChanged!
      }
    });

    await syncPeachRecords();

    expect(getRecSpy).toHaveBeenCalledTimes(1);
    expect(upsertSpy).not.toHaveBeenCalled();
  });

  it('logs failures but continues when some PEACH fetches reject', async () => {
    searchSpy.mockResolvedValueOnce([TEST_PERMIT_1, TEST_PERMIT_2]);

    getRecSpy.mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce(TEST_PEACH_RECORD_2);

    parseSpy.mockReturnValueOnce({
      [`${PeachIntegratedSystem.VFCBC}REC-XYZ`]: {
        state: PermitState.IN_PROGRESS,
        stage: PermitStage.PRE_SUBMISSION,
        submittedDate: undefined,
        adjudicationDate: undefined,
        statusLastChanged: new Date('2024-01-20T00:00:00.000Z')
      }
    });

    stampsSpy.mockReturnValue({
      updatedAt: new Date('2024-02-02T00:00:00.000Z'),
      updatedBy: 'user-abc'
    });

    await syncPeachRecords();

    expect(getRecSpy).toHaveBeenCalledTimes(2);
    expect(upsertSpy).toHaveBeenCalledTimes(1);
  });

  it('ignores permits without a VFCBC tracking', async () => {
    searchSpy.mockResolvedValueOnce([TEST_PERMIT_4, TEST_PERMIT_3]);

    await syncPeachRecords();

    expect(getRecSpy).not.toHaveBeenCalled();
    expect(parseSpy).toHaveBeenCalledTimes(1);
    expect(parseSpy).toHaveBeenCalledWith([]);
    expect(upsertSpy).not.toHaveBeenCalled();
  });

  it('skips upsert when parser returns undefined stage/state', async () => {
    searchSpy.mockResolvedValueOnce([TEST_PERMIT_1]);
    getRecSpy.mockResolvedValueOnce(TEST_PEACH_RECORD_1);

    parseSpy.mockReturnValueOnce({
      [`${PeachIntegratedSystem.VFCBC}REC-123`]: {
        state: undefined,
        stage: undefined,
        submittedDate: new Date('2024-01-10T00:00:00.000Z'),
        adjudicationDate: undefined,
        statusLastChanged: new Date('2024-01-15T00:00:00.000Z')
      }
    });

    await syncPeachRecords();

    expect(getRecSpy).toHaveBeenCalledTimes(1);
    expect(parseSpy).toHaveBeenCalledTimes(1);
    expect(upsertSpy).not.toHaveBeenCalled();
  });
});
