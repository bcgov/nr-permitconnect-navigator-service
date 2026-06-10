import {
  searchBasicBceidUsersController,
  searchBusinessBceidUsersController,
  searchIdirUsersController
} from '../../../src/controllers/sso.ts';
import * as ssoService from '../../../src/services/sso.ts';

import type { Request, Response } from 'express';
import type { Mock } from 'vitest';
import type { BceidSearchParameters, IdirSearchParameters } from '../../../src/types/index.ts';

const mockResponse = () => {
  const res: { status?: Mock; json?: Mock } = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
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

describe('searchBasicBceidUsersController', () => {
  const spy = vi.spyOn(ssoService, 'searchBasicBceidUsers');

  it('passes query through and forwards status and data', async () => {
    const query: BceidSearchParameters = { guid: 'abc' };
    spy.mockResolvedValueOnce({ status: 200, data: [{ id: 2 }] });

    await searchBasicBceidUsersController(
      { query } as Request<never, never, never, BceidSearchParameters>,
      res as unknown as Response
    );

    expect(spy).toHaveBeenCalledWith(query);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ id: 2 }]);
  });
});

describe('searchBusinessBceidUsersController', () => {
  const spy = vi.spyOn(ssoService, 'searchBusinessBceidUsers');

  it('passes query through and forwards status and data', async () => {
    const query: BceidSearchParameters = { guid: 'xyz' };
    spy.mockResolvedValueOnce({ status: 200, data: [{ id: 3 }] });

    await searchBusinessBceidUsersController(
      { query } as Request<never, never, never, BceidSearchParameters>,
      res as unknown as Response
    );

    expect(spy).toHaveBeenCalledWith(query);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ id: 3 }]);
  });
});
