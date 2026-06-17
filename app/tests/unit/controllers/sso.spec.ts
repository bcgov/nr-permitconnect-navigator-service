import { searchIdirUsersController } from '../../../src/controllers/sso.ts';
import * as ssoService from '../../../src/services/sso.ts';

import type { Request, Response } from 'express';
import type { Mock } from 'vitest';
import type { IdirSearchParameters } from '../../../src/types/index.ts';

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
});

afterEach(() => {
  vi.resetAllMocks();
});

describe('searchIdirUsersController', () => {
  const spy = vi.spyOn(ssoService, 'searchIdirUsers');

  it('passes query through and forwards status and data', async () => {
    const query: IdirSearchParameters = { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' };
    spy.mockResolvedValueOnce({ status: 200, data: [{ id: 1 }] });

    await searchIdirUsersController(
      { query } as Request<never, never, never, IdirSearchParameters>,
      res as unknown as Response
    );

    expect(spy).toHaveBeenCalledWith(query);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
  });
});
