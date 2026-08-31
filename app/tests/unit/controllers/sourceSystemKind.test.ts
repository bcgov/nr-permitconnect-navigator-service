import { listSourceSystemKindsController } from '#src/controllers/sourceSystemKind';
import * as sourceSystemKindService from '#src/services/sourceSystemKind';

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

describe('listSourceSystemKindsController', () => {
  it('should call service and respond with 200 and result', async () => {
    const fakeResult = [{ sourceSystemKindId: 1, sourceSystem: 'PEACH', kind: 'BUILDING' }];
    vi.spyOn(sourceSystemKindService, 'listSourceSystemKindsService').mockResolvedValueOnce(fakeResult as never);

    await listSourceSystemKindsController({} as Request, res as unknown as Response);

    expect(sourceSystemKindService.listSourceSystemKindsService).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeResult);
  });
});
