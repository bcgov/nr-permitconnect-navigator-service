import {
  TEST_PEACH_RECORD_1,
  TEST_PEACH_RECORD_2,
  TEST_PEACH_SUMMARY,
  TEST_PERMIT_1,
  TEST_PERMIT_2,
  TEST_PERMIT_3,
  TEST_PERMIT_4
} from '../data';
import { prismaTxMock } from '../../__mocks__/prismaMock';
import { syncPeachRecords, getPeachRecordController } from '../../../src/controllers/peach';
import * as parser from '../../../src/parsers/peachParser';
import * as permitService from '../../../src/services/permit';
import * as peachService from '../../../src/services/peach';
import { PeachIntegratedSystem, PermitStage, PermitState } from '../../../src/utils/enums/permit';
import * as txWrapper from '../../../src/db/utils/transactionWrapper';
import * as stamps from '../../../src/db/utils/utils';
import { splitDateTime, Problem } from '../../../src/utils';

import type { Request, Response } from 'express';

jest.mock('config');

jest.mock('../../../src/components/log', () => ({
  getLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    verbose: jest.fn(),
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
  const summarizeSpy = jest.spyOn(parser, 'summarizeRecord');

  it('should call service, summarize, and respond with 200 and summary', async () => {
    const req = {
      params: {
        recordId: TEST_PEACH_RECORD_1.record_id,
        systemId: TEST_PEACH_RECORD_1.system_id
      }
    };

    getPeachRecordSpy.mockResolvedValue(TEST_PEACH_RECORD_1);
    summarizeSpy.mockReturnValue(TEST_PEACH_SUMMARY);

    await getPeachRecordController(
      req as unknown as Request<{ recordId: string; systemId: string }>,
      res as unknown as Response
    );

    expect(getPeachRecordSpy).toHaveBeenCalledTimes(1);
    expect(getPeachRecordSpy).toHaveBeenCalledWith(TEST_PEACH_RECORD_1.record_id, TEST_PEACH_RECORD_1.system_id);
    expect(summarizeSpy).toHaveBeenCalledTimes(1);
    expect(summarizeSpy).toHaveBeenCalledWith(TEST_PEACH_RECORD_1);
    expect(res.status).toHaveBeenCalledWith(200);

    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(payload).toEqual(TEST_PEACH_SUMMARY);
  });

  it('throws Problem(404) when summarizeRecord returns null-ish', async () => {
    const req = {
      params: {
        recordId: TEST_PEACH_RECORD_1.record_id,
        systemId: TEST_PEACH_RECORD_1.system_id
      }
    };

    getPeachRecordSpy.mockResolvedValue(TEST_PEACH_RECORD_1);
    summarizeSpy.mockReturnValue(null);

    await expect(
      getPeachRecordController(
        req as unknown as Request<{ recordId: string; systemId: string }>,
        res as unknown as Response
      )
    ).rejects.toBeInstanceOf(Problem);
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

    parseSpy.mockReturnValueOnce({
      [`${PeachIntegratedSystem.VFCBC}REC-123`]: TEST_PEACH_SUMMARY
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
        state: TEST_PEACH_SUMMARY.state,
        stage: TEST_PEACH_SUMMARY.stage,
        submittedDate: TEST_PEACH_SUMMARY.submittedDate,
        submittedTime: TEST_PEACH_SUMMARY.submittedTime,
        decisionDate: TEST_PEACH_SUMMARY.decisionDate,
        decisionTime: TEST_PEACH_SUMMARY.decisionTime,
        statusLastChanged: TEST_PEACH_SUMMARY.statusLastChanged,
        statusLastChangedTime: TEST_PEACH_SUMMARY.statusLastChangedTime,
        statusLastVerified: TEST_PEACH_SUMMARY.statusLastChanged,
        statusLastVerifiedTime: TEST_PEACH_SUMMARY.statusLastChangedTime,
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
        submittedTime: null,
        decisionDate: null,
        decisionTime: null,
        statusLastChanged: TEST_PERMIT_2.statusLastChanged!,
        statusLastChangedTime: null
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
        submittedDate: null,
        submittedTime: null,
        decisionDate: null,
        decisionTime: null,
        statusLastChanged: '2024-01-20',
        statusLastChangedTime: null
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

  it('respects PEACH_TRACKING_PRIORITY and skips invalid/mismatched trackings', async () => {
    const baseTracking = TEST_PERMIT_1.permitTracking![0];

    // 1) No sourceSystem
    const trackingNoSource = {
      ...baseTracking,
      permitTrackingId: 11,
      sourceSystemKind: {
        ...baseTracking.sourceSystemKind!,
        sourceSystem: undefined as unknown as string
      }
    };

    // 2) TANTALIS but wrong trackingName
    const trackingWrongName = {
      ...baseTracking,
      permitTrackingId: 12,
      trackingId: 'TANT-WRONG',
      sourceSystemKind: {
        ...baseTracking.sourceSystemKind!,
        sourceSystem: PeachIntegratedSystem.TANTALIS,
        description: 'Wrong name'
      }
    };

    // 3) TANTALIS with correct name
    const trackingTantalis = {
      ...baseTracking,
      permitTrackingId: 13,
      trackingId: 'TANT-123',
      sourceSystemKind: {
        ...baseTracking.sourceSystemKind!,
        sourceSystem: PeachIntegratedSystem.TANTALIS,
        description: 'Disposition Transaction ID'
      }
    };

    // 4) VFCBC after TANTALIS (lower priority)
    const trackingVfcbc = {
      ...baseTracking,
      permitTrackingId: 14,
      trackingId: 'REC-123',
      sourceSystemKind: {
        ...baseTracking.sourceSystemKind!,
        sourceSystem: PeachIntegratedSystem.VFCBC,
        description: 'Tracking Number'
      }
    };

    const permitWithMultipleTrackings = {
      ...TEST_PERMIT_1,
      state: PermitState.NONE,
      stage: PermitStage.PRE_SUBMISSION,
      submittedDate: null,
      decisionDate: null,
      statusLastChanged: null,
      statusLastVerified: null,
      permitTracking: [trackingNoSource, trackingWrongName, trackingTantalis, trackingVfcbc]
    };

    searchSpy.mockResolvedValueOnce([permitWithMultipleTrackings]);
    getRecSpy.mockResolvedValueOnce(TEST_PEACH_RECORD_1);

    parseSpy.mockReturnValueOnce({
      [`${PeachIntegratedSystem.TANTALIS}TANT-123`]: TEST_PEACH_SUMMARY
    });

    const fixedNow = new Date('2024-02-03T00:00:00.000Z');
    stampsSpy.mockReturnValue({ updatedAt: fixedNow, updatedBy: 'user-priority' });

    await syncPeachRecords();

    expect(getRecSpy).toHaveBeenCalledTimes(1);
    expect(getRecSpy).toHaveBeenCalledWith('TANT-123', PeachIntegratedSystem.TANTALIS);

    expect(upsertSpy).toHaveBeenCalledTimes(1);
    expect(upsertSpy).toHaveBeenCalledWith(
      prismaTxMock,
      expect.objectContaining({
        permitId: permitWithMultipleTrackings.permitId,
        state: TEST_PEACH_SUMMARY.state,
        stage: TEST_PEACH_SUMMARY.stage,
        submittedDate: TEST_PEACH_SUMMARY.submittedDate,
        submittedTime: TEST_PEACH_SUMMARY.submittedTime,
        statusLastChanged: TEST_PEACH_SUMMARY.statusLastChanged,
        statusLastChangedTime: TEST_PEACH_SUMMARY.statusLastChangedTime,
        statusLastVerified: TEST_PEACH_SUMMARY.statusLastChanged,
        statusLastVerifiedTime: TEST_PEACH_SUMMARY.statusLastChangedTime,
        updatedAt: fixedNow,
        updatedBy: 'user-priority'
      })
    );
  });

  it('skips permits when chosen tracking is missing a recordId', async () => {
    const permitWithMissingTrackingId = {
      ...TEST_PERMIT_1,
      permitTracking: [
        {
          ...TEST_PERMIT_1.permitTracking![0],
          trackingId: ''
        }
      ]
    };

    searchSpy.mockResolvedValueOnce([permitWithMissingTrackingId]);

    await syncPeachRecords();

    expect(getRecSpy).not.toHaveBeenCalled();
    expect(parseSpy).toHaveBeenCalledTimes(1);
    expect(parseSpy).toHaveBeenCalledWith([]);
    expect(upsertSpy).not.toHaveBeenCalled();
  });

  it('does not overwrite statusLastVerified when it is more recent than PEACH statusLastChanged', async () => {
    const permitWithVerifiedLater = {
      ...TEST_PERMIT_2,
      statusLastVerified: '2024-01-20'
    };

    searchSpy.mockResolvedValueOnce([permitWithVerifiedLater]);
    getRecSpy.mockResolvedValueOnce(TEST_PEACH_RECORD_1);

    const peachStatusChanged = '2024-01-10';

    parseSpy.mockReturnValueOnce({
      [`${PeachIntegratedSystem.VFCBC}REC-XYZ`]: {
        state: permitWithVerifiedLater.state,
        stage: permitWithVerifiedLater.stage,
        submittedDate: permitWithVerifiedLater.submittedDate!,
        submittedTime: null,
        decisionDate: null,
        decisionTime: null,
        statusLastChanged: peachStatusChanged,
        statusLastChangedTime: null
      }
    });

    const fixedNow = new Date('2024-02-05T12:00:00.000Z');
    stampsSpy.mockReturnValue({ updatedAt: fixedNow, updatedBy: 'user-xyz' });

    await syncPeachRecords();

    expect(getRecSpy).toHaveBeenCalledTimes(1);

    expect(upsertSpy).toHaveBeenCalledTimes(1);
    expect(upsertSpy).toHaveBeenCalledWith(
      prismaTxMock,
      expect.objectContaining({
        permitId: permitWithVerifiedLater.permitId,
        statusLastChanged: peachStatusChanged,
        statusLastChangedTime: null,
        statusLastVerified: permitWithVerifiedLater.statusLastVerified,
        statusLastVerifiedTime: permitWithVerifiedLater.statusLastVerifiedTime,
        updatedAt: fixedNow,
        updatedBy: 'user-xyz'
      })
    );
  });

  it('skips permitTrackings that are missing a sourceSystem', async () => {
    const permitWithMissingSourceSystem = {
      ...TEST_PERMIT_1,
      permitTracking: [
        {
          ...TEST_PERMIT_1.permitTracking![0],
          sourceSystemKind: {
            ...TEST_PERMIT_1.permitTracking![0].sourceSystemKind!,
            sourceSystem: undefined as unknown as PeachIntegratedSystem
          }
        }
      ]
    };

    searchSpy.mockResolvedValueOnce([permitWithMissingSourceSystem]);

    await syncPeachRecords();

    expect(getRecSpy).not.toHaveBeenCalled();
    expect(parseSpy).toHaveBeenCalledTimes(1);
    expect(parseSpy).toHaveBeenCalledWith([]);
    expect(upsertSpy).not.toHaveBeenCalled();
  });

  it('handles permits where permitTracking is undefined (nullish-coalescing to [])', async () => {
    const permitWithoutTrackingProp = {
      ...TEST_PERMIT_1,
      permitTracking: undefined
    };

    searchSpy.mockResolvedValueOnce([permitWithoutTrackingProp]);

    await syncPeachRecords();

    expect(getRecSpy).not.toHaveBeenCalled();
    expect(parseSpy).toHaveBeenCalledTimes(1);
    expect(parseSpy).toHaveBeenCalledWith([]);
    expect(upsertSpy).not.toHaveBeenCalled();
  });

  it('skips permitTrackings when sourceSystemKind itself is undefined', async () => {
    const permitWithNoSourceSystemKind = {
      ...TEST_PERMIT_1,
      permitTracking: [
        {
          ...TEST_PERMIT_1.permitTracking![0],
          sourceSystemKind: undefined
        }
      ]
    };

    searchSpy.mockResolvedValueOnce([permitWithNoSourceSystemKind]);

    await syncPeachRecords();

    expect(getRecSpy).not.toHaveBeenCalled();
    expect(parseSpy).toHaveBeenCalledTimes(1);
    expect(parseSpy).toHaveBeenCalledWith([]);
    expect(upsertSpy).not.toHaveBeenCalled();
  });

  it('skips permitTrackings whose sourceSystem is not in PEACH_TRACKING_PRIORITY', async () => {
    const permitWithUnknownSource = {
      ...TEST_PERMIT_1,
      permitTracking: [
        {
          ...TEST_PERMIT_1.permitTracking![0],
          sourceSystemKind: {
            ...TEST_PERMIT_1.permitTracking![0].sourceSystemKind!,
            sourceSystem: 'UNKNOWN_SYS' as unknown as PeachIntegratedSystem,
            description: 'Some desc'
          }
        }
      ]
    };

    searchSpy.mockResolvedValueOnce([permitWithUnknownSource]);

    await syncPeachRecords();

    expect(getRecSpy).not.toHaveBeenCalled();
    expect(parseSpy).toHaveBeenCalledTimes(1);
    expect(parseSpy).toHaveBeenCalledWith([]);
    expect(upsertSpy).not.toHaveBeenCalled();
  });

  it('handles equal decisionDate and statusLastChanged but different stage/state', async () => {
    const baseDate = '2024-03-10';
    const permitWithDecision = {
      ...TEST_PERMIT_2,
      state: PermitState.NONE,
      stage: PermitStage.PRE_SUBMISSION,
      decisionDate: baseDate,
      statusLastChanged: baseDate
    };

    searchSpy.mockResolvedValueOnce([permitWithDecision]);
    getRecSpy.mockResolvedValueOnce(TEST_PEACH_RECORD_1);

    const summary = {
      state: PermitState.IN_PROGRESS,
      stage: PermitStage.APPLICATION_SUBMISSION,
      submittedDate: permitWithDecision.submittedDate!,
      submittedTime: null,
      decisionDate: baseDate,
      decisionTime: null,
      statusLastChanged: baseDate,
      statusLastChangedTime: null
    };

    parseSpy.mockReturnValueOnce({
      [`${PeachIntegratedSystem.VFCBC}REC-XYZ`]: summary
    });

    const fixedNow = new Date('2024-03-20T12:00:00.000Z');
    stampsSpy.mockReturnValue({ updatedAt: fixedNow, updatedBy: 'user-adj-same' });

    await syncPeachRecords();

    expect(getRecSpy).toHaveBeenCalledTimes(1);

    expect(upsertSpy).toHaveBeenCalledTimes(1);
    expect(upsertSpy).toHaveBeenCalledWith(
      prismaTxMock,
      expect.objectContaining({
        permitId: permitWithDecision.permitId,
        state: PermitState.IN_PROGRESS,
        stage: PermitStage.APPLICATION_SUBMISSION,
        submittedDate: permitWithDecision.submittedDate,
        decisionDate: baseDate,
        decisionTime: null,
        statusLastChanged: baseDate,
        statusLastChangedTime: null,
        statusLastVerified: baseDate,
        statusLastVerifiedTime: null,
        updatedAt: fixedNow,
        updatedBy: 'user-adj-same'
      })
    );
  });

  it('does not upsert when PCNS split date/time matches PEACH timestamps', async () => {
    const submittedCombined = new Date('2024-01-10T09:30:00.000Z');
    const decisionCombined = new Date('2024-02-01T15:45:00.000Z');
    const statusChangedCombined = new Date('2024-01-20T18:00:00.000Z');

    const { date: submittedDate, time: submittedTime } = splitDateTime(submittedCombined);
    const { date: decisionDate, time: decisionTime } = splitDateTime(decisionCombined);
    const { date: statusLastChanged, time: statusLastChangedTime } = splitDateTime(statusChangedCombined);

    const permitWithSplitFields = {
      ...TEST_PERMIT_1,
      state: PermitState.IN_PROGRESS,
      stage: PermitStage.APPLICATION_SUBMISSION,
      submittedDate,
      submittedTime,
      decisionDate,
      decisionTime,
      statusLastChanged,
      statusLastChangedTime,
      statusLastVerified: statusLastChanged,
      statusLastVerifiedTime: statusLastChangedTime
    };

    searchSpy.mockResolvedValueOnce([permitWithSplitFields]);
    getRecSpy.mockResolvedValueOnce(TEST_PEACH_RECORD_1);

    parseSpy.mockReturnValueOnce({
      [`${PeachIntegratedSystem.VFCBC}${permitWithSplitFields.permitTracking![0].trackingId}`]: {
        state: PermitState.IN_PROGRESS,
        stage: PermitStage.APPLICATION_SUBMISSION,
        submittedDate,
        submittedTime,
        decisionDate,
        decisionTime,
        statusLastChanged,
        statusLastChangedTime
      }
    });

    await syncPeachRecords();

    expect(getRecSpy).toHaveBeenCalledTimes(1);
    expect(upsertSpy).not.toHaveBeenCalled();
  });

  it('respects PEACH_TRACKING_PRIORITY and skips invalid/mismatched trackings', async () => {
    const baseTracking = TEST_PERMIT_1.permitTracking![0];

    // 1) No sourceSystem -> hits `if (!sourceSystem) continue;`
    const trackingNoSource = {
      ...baseTracking,
      permitTrackingId: 11,
      sourceSystemKind: {
        ...baseTracking.sourceSystemKind!,
        sourceSystem: undefined as unknown as string
      }
    };

    // 2) TANTALIS but wrong trackingName -> hits trackingName mismatch branch
    const trackingWrongName = {
      ...baseTracking,
      permitTrackingId: 12,
      trackingId: 'TANT-WRONG',
      sourceSystemKind: {
        ...baseTracking.sourceSystemKind!,
        sourceSystem: PeachIntegratedSystem.TANTALIS,
        description: 'Wrong name'
      }
    };

    // 3) TANTALIS with correct name -> becomes selected, priorityIndex = 0
    const trackingTantalis = {
      ...baseTracking,
      permitTrackingId: 13,
      trackingId: 'TANT-123',
      sourceSystemKind: {
        ...baseTracking.sourceSystemKind!,
        sourceSystem: PeachIntegratedSystem.TANTALIS,
        description: 'Disposition Transaction ID'
      }
    };

    // 4) VFCBC after TANTALIS -> index (2) > priorityIndex (0), hits `if (index > priorityIndex) continue;`
    const trackingVfcbc = {
      ...baseTracking,
      permitTrackingId: 14,
      trackingId: 'REC-123',
      sourceSystemKind: {
        ...baseTracking.sourceSystemKind!,
        sourceSystem: PeachIntegratedSystem.VFCBC,
        description: 'Tracking Number'
      }
    };

    // IMPORTANT: override the status fields so they differ from the summary
    const permitWithMultipleTrackings = {
      ...TEST_PERMIT_1,
      state: PermitState.NONE,
      stage: PermitStage.PRE_SUBMISSION,
      submittedDate: null,
      adjudicationDate: null,
      statusLastChanged: null,
      statusLastVerified: null,
      permitTracking: [trackingNoSource, trackingWrongName, trackingTantalis, trackingVfcbc]
    };

    searchSpy.mockResolvedValueOnce([permitWithMultipleTrackings]);
    getRecSpy.mockResolvedValueOnce(TEST_PEACH_RECORD_1);

    const summary = {
      state: PermitState.IN_PROGRESS,
      stage: PermitStage.APPLICATION_SUBMISSION,
      submittedDate: new Date('2024-01-10T00:00:00.000Z'),
      adjudicationDate: undefined,
      statusLastChanged: new Date('2024-01-15T00:00:00.000Z')
    };

    parseSpy.mockReturnValueOnce({
      [`${PeachIntegratedSystem.TANTALIS}TANT-123`]: summary
    });

    const fixedNow = new Date('2024-02-03T00:00:00.000Z');
    stampsSpy.mockReturnValue({ updatedAt: fixedNow, updatedBy: 'user-priority' });

    await syncPeachRecords();

    // Should have called PEACH with the TANTALIS tracking (highest priority)
    expect(getRecSpy).toHaveBeenCalledTimes(1);
    expect(getRecSpy).toHaveBeenCalledWith('TANT-123', PeachIntegratedSystem.TANTALIS);

    // And we should have performed an upsert based on that summary
    expect(upsertSpy).toHaveBeenCalledTimes(1);
    expect(upsertSpy).toHaveBeenCalledWith(
      prismaTxMock,
      expect.objectContaining({
        permitId: permitWithMultipleTrackings.permitId,
        state: PermitState.IN_PROGRESS,
        stage: PermitStage.APPLICATION_SUBMISSION,
        submittedDate: summary.submittedDate,
        statusLastChanged: summary.statusLastChanged,
        statusLastVerified: summary.statusLastChanged,
        updatedAt: fixedNow,
        updatedBy: 'user-priority'
      })
    );
  });

  it('skips permits when chosen tracking is missing a recordId', async () => {
    const permitWithMissingTrackingId = {
      ...TEST_PERMIT_1,
      permitTracking: [
        {
          ...TEST_PERMIT_1.permitTracking![0],
          trackingId: ''
        }
      ]
    };

    searchSpy.mockResolvedValueOnce([permitWithMissingTrackingId]);

    await syncPeachRecords();

    expect(getRecSpy).not.toHaveBeenCalled();

    expect(parseSpy).toHaveBeenCalledTimes(1);
    expect(parseSpy).toHaveBeenCalledWith([]);

    expect(upsertSpy).not.toHaveBeenCalled();
  });

  it('does not overwrite statusLastVerified when it is more recent than PEACH statusLastChanged', async () => {
    const permitWithVerifiedLater = {
      ...TEST_PERMIT_2,
      statusLastVerified: new Date('2024-01-20T00:00:00.000Z')
    };

    searchSpy.mockResolvedValueOnce([permitWithVerifiedLater]);
    getRecSpy.mockResolvedValueOnce(TEST_PEACH_RECORD_1);

    const peachStatusChanged = new Date('2024-01-10T00:00:00.000Z');

    parseSpy.mockReturnValueOnce({
      [`${PeachIntegratedSystem.VFCBC}REC-XYZ`]: {
        state: permitWithVerifiedLater.state,
        stage: permitWithVerifiedLater.stage,
        submittedDate: permitWithVerifiedLater.submittedDate!,
        adjudicationDate: undefined,
        statusLastChanged: peachStatusChanged
      }
    });

    const fixedNow = new Date('2024-02-05T12:00:00.000Z');
    stampsSpy.mockReturnValue({ updatedAt: fixedNow, updatedBy: 'user-xyz' });

    await syncPeachRecords();

    expect(getRecSpy).toHaveBeenCalledTimes(1);

    expect(upsertSpy).toHaveBeenCalledTimes(1);
    expect(upsertSpy).toHaveBeenCalledWith(
      prismaTxMock,
      expect.objectContaining({
        permitId: permitWithVerifiedLater.permitId,
        statusLastChanged: peachStatusChanged,
        statusLastVerified: new Date('2024-01-20T00:00:00.000Z'),
        updatedAt: fixedNow,
        updatedBy: 'user-xyz'
      })
    );
  });

  it('skips permitTrackings that are missing a sourceSystem', async () => {
    const permitWithMissingSourceSystem = {
      ...TEST_PERMIT_1,
      permitTracking: [
        {
          ...TEST_PERMIT_1.permitTracking![0],
          sourceSystemKind: {
            ...TEST_PERMIT_1.permitTracking![0].sourceSystemKind!,
            sourceSystem: undefined as unknown as PeachIntegratedSystem
          }
        }
      ]
    };

    searchSpy.mockResolvedValueOnce([permitWithMissingSourceSystem]);

    await syncPeachRecords();

    expect(getRecSpy).not.toHaveBeenCalled();
    expect(parseSpy).toHaveBeenCalledTimes(1);
    expect(parseSpy).toHaveBeenCalledWith([]);
    expect(upsertSpy).not.toHaveBeenCalled();
  });

  it('handles permits where permitTracking is undefined (nullish-coalescing to [])', async () => {
    const permitWithoutTrackingProp = {
      ...TEST_PERMIT_1,
      permitTracking: undefined
    };

    searchSpy.mockResolvedValueOnce([permitWithoutTrackingProp]);

    await syncPeachRecords();

    expect(getRecSpy).not.toHaveBeenCalled();
    expect(parseSpy).toHaveBeenCalledTimes(1);
    expect(parseSpy).toHaveBeenCalledWith([]);
    expect(upsertSpy).not.toHaveBeenCalled();
  });

  it('skips permitTrackings when sourceSystemKind itself is undefined', async () => {
    const permitWithNoSourceSystemKind = {
      ...TEST_PERMIT_1,
      permitTracking: [
        {
          ...TEST_PERMIT_1.permitTracking![0],
          sourceSystemKind: undefined
        }
      ]
    };

    searchSpy.mockResolvedValueOnce([permitWithNoSourceSystemKind]);

    await syncPeachRecords();

    expect(getRecSpy).not.toHaveBeenCalled();
    expect(parseSpy).toHaveBeenCalledTimes(1);
    expect(parseSpy).toHaveBeenCalledWith([]);
    expect(upsertSpy).not.toHaveBeenCalled();
  });

  it('handles equal adjudication and statusLastChanged but different stage/state', async () => {
    const baseDate = new Date('2024-03-10T00:00:00.000Z');
    const permitWithAdjudication = {
      ...TEST_PERMIT_2,
      state: PermitState.NONE,
      stage: PermitStage.PRE_SUBMISSION,
      adjudicationDate: baseDate,
      statusLastChanged: baseDate
    };

    searchSpy.mockResolvedValueOnce([permitWithAdjudication]);
    getRecSpy.mockResolvedValueOnce(TEST_PEACH_RECORD_1);

    const summary = {
      state: PermitState.IN_PROGRESS,
      stage: PermitStage.APPLICATION_SUBMISSION,
      submittedDate: permitWithAdjudication.submittedDate!,
      adjudicationDate: baseDate,
      statusLastChanged: baseDate
    };

    parseSpy.mockReturnValueOnce({
      [`${PeachIntegratedSystem.VFCBC}REC-XYZ`]: summary
    });

    const fixedNow = new Date('2024-03-20T12:00:00.000Z');
    stampsSpy.mockReturnValue({ updatedAt: fixedNow, updatedBy: 'user-adj-same' });

    await syncPeachRecords();

    expect(getRecSpy).toHaveBeenCalledTimes(1);

    expect(upsertSpy).toHaveBeenCalledTimes(1);
    expect(upsertSpy).toHaveBeenCalledWith(
      prismaTxMock,
      expect.objectContaining({
        permitId: permitWithAdjudication.permitId,
        state: PermitState.IN_PROGRESS,
        stage: PermitStage.APPLICATION_SUBMISSION,
        submittedDate: permitWithAdjudication.submittedDate,
        adjudicationDate: baseDate,
        statusLastChanged: baseDate,
        statusLastVerified: baseDate,
        updatedAt: fixedNow,
        updatedBy: 'user-adj-same'
      })
    );
  });
});
