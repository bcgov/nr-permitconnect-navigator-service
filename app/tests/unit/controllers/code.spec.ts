import { listCodeTablesController } from '../../../src/controllers/code.ts';
import * as codeService from '../../../src/services/code.ts';

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

describe('listCodeTablesController', () => {
  it('should call service and respond with 200 and result', async () => {
    const fakeResult = { foo: [{ code: 'X', display: 'X', definition: 'X' }] };
    vi.spyOn(codeService, 'listCodeTablesService').mockResolvedValueOnce(fakeResult as never);

    await listCodeTablesController({} as Request, res as unknown as Response);

    expect(codeService.listCodeTablesService).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeResult);
  });
});
