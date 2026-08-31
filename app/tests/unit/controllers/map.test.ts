import { getPidsController } from '#src/controllers/map';
import * as mapService from '#src/services/map';

import type { Request, Response } from 'express';
import type { Mock } from 'vitest';

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

describe('getPidsController', () => {
  it('should call getPidsService with projectId and respond with 200 when PIDs returned', async () => {
    const mockPids = '123|456|789';
    vi.spyOn(mapService, 'getPidsService').mockResolvedValueOnce(mockPids);

    const req = { params: { projectId: 'PRJ-001' } } as unknown as Request<{ projectId: string }>;

    await getPidsController(req, res as unknown as Response);

    expect(mapService.getPidsService).toHaveBeenCalledTimes(1);
    expect(mapService.getPidsService).toHaveBeenCalledWith('PRJ-001');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockPids);
  });

  it('should call getPidsService and respond with 204 when no PIDs returned', async () => {
    vi.spyOn(mapService, 'getPidsService').mockResolvedValueOnce(undefined);

    const req = { params: { projectId: 'PRJ-002' } } as unknown as Request<{ projectId: string }>;

    await getPidsController(req, res as unknown as Response);

    expect(mapService.getPidsService).toHaveBeenCalledTimes(1);
    expect(mapService.getPidsService).toHaveBeenCalledWith('PRJ-002');
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.json).toHaveBeenCalledWith(undefined);
  });
});
