import { getPeachSummaryController } from '#src/controllers/peach';
import * as peachService from '#src/services/peach';

import type { Request, Response } from 'express';
import type { Mock } from 'vitest';
import type { GetPeachSummaryRequest, PermitTracking } from '#types';

vi.mock('config');

const mockResponse = () => {
  const res: { locals: Record<string, unknown>; status?: Mock; json?: Mock; end?: Mock } = {
    locals: {}
  };
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.end = vi.fn().mockReturnValue(res);
  return res;
};

let res = mockResponse();
beforeEach(() => {
  res = mockResponse();
  vi.clearAllMocks();
});

describe('getPeachSummaryController', () => {
  it('should call getPeachSummaryService with permit trackings and respond with 200 and data', async () => {
    const mockSummary = { status: 'APPROVED', lastUpdate: '2024-01-01' };
    vi.spyOn(peachService, 'getPeachSummaryService').mockReturnValueOnce(mockSummary as never);

    const permitTrackings: PermitTracking[] = [
      {
        permitTrackingId: 1,
        trackingId: 'REC-SUB',
        sourceSystemKindId: 1,
        permitId: 'perm-1',
        shownToProponent: true,
        createdBy: 'system',
        createdAt: new Date(),
        updatedBy: 'system',
        updatedAt: new Date(),
        deletedBy: null,
        deletedAt: null,
        sourceSystemKind: {
          sourceSystemKindId: 1,
          sourceSystem: 'VFCBC',
          integrated: true,
          kind: null,
          description: 'Tracking',
          createdBy: 'system',
          createdAt: new Date(),
          updatedBy: 'system',
          updatedAt: new Date(),
          deletedBy: null,
          deletedAt: null
        }
      }
    ];

    const req = {
      body: { permitTrackings }
    } as unknown as Request<never, never, GetPeachSummaryRequest, never>;

    await getPeachSummaryController(req, res as unknown as Response);

    expect(peachService.getPeachSummaryService).toHaveBeenCalledTimes(1);
    expect(peachService.getPeachSummaryService).toHaveBeenCalledWith(permitTrackings);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockSummary);
  });
});
