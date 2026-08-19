import { searchIdirUsersController } from '#src/controllers/sso';
import * as ssoExternal from '#src/external/sso';

import type { Request, Response } from 'express';
import type { Mock } from 'vitest';
import type { IdirSearchParameters } from '#types';

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

describe('searchIdirUsersController', () => {
  it('should call searchIdirUsers with query params and respond with status and data', async () => {
    const mockResp = { status: 200, data: [{ id: 'user-1', name: 'Test User' }] };
    vi.spyOn(ssoExternal, 'searchIdirUsers').mockResolvedValueOnce(mockResp);

    const query: IdirSearchParameters = { firstName: 'Jane', lastName: 'Doe' } as unknown as IdirSearchParameters;
    const req = { query } as unknown as Request<never, never, never, IdirSearchParameters>;

    await searchIdirUsersController(req, res as unknown as Response);

    expect(ssoExternal.searchIdirUsers).toHaveBeenCalledTimes(1);
    expect(ssoExternal.searchIdirUsers).toHaveBeenCalledWith(query);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ id: 'user-1', name: 'Test User' }]);
  });
});
