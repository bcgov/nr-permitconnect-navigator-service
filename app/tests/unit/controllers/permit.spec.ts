import { TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR, TEST_CURRENT_CONTEXT, TEST_PERMIT_1 } from '../data/index.ts';
import {
  deletePermitController,
  getPermitController,
  listPermitsController,
  searchPermitsController,
  upsertPermitController
} from '../../../src/controllers/permit.ts';
import * as permitService from '../../../src/services/permit.ts';
import { Initiative } from '../../../src/utils/enums/application.ts';
import { Problem } from '../../../src/utils/index.ts';

import type { Request, Response } from 'express';
import type { Mock } from 'vitest';
import type { ListPermitsOptions, LocalContext, Permit, SearchPermitsOptions } from '../../../src/types/index.ts';

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
  vi.clearAllMocks();
  res = mockResponse();
  res.locals.currentContext = TEST_CURRENT_CONTEXT;
  res.locals.currentAuthorization = TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR;
});

describe('deletePermitController', () => {
  const deleteSpy = vi.spyOn(permitService, 'deletePermitService');

  it('calls the service with permitId then responds 204', async () => {
    const req = {
      params: { permitId: 'permit-123' }
    } as unknown as Request<{ permitId: string }>;

    deleteSpy.mockResolvedValue(undefined);

    await deletePermitController(req, res as unknown as Response);

    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(req.params.permitId);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalledWith();
  });
});

describe('getPermitController', () => {
  const getSpy = vi.spyOn(permitService, 'getPermitService');

  it('calls the service with permitId then responds 200', async () => {
    const req = {
      params: { permitId: 'permit-123' }
    } as unknown as Request<{ permitId: string }>;

    getSpy.mockResolvedValue(TEST_PERMIT_1);

    await getPermitController(req, res as unknown as Response);

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith(req.params.permitId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_PERMIT_1);
  });
});

describe('listPermitsController', () => {
  const listSpy = vi.spyOn(permitService, 'listPermitsService');

  it('calls the service with options and context then responds 200', async () => {
    const req = {
      query: { includeNotes: 'true' }
    } as unknown as Request<never, never, never, Partial<ListPermitsOptions>>;

    listSpy.mockResolvedValue([TEST_PERMIT_1]);

    await listPermitsController(req, res as unknown as Response<Permit[], LocalContext>);

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith(
      TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
      TEST_CURRENT_CONTEXT,
      expect.objectContaining({ includeNotes: true })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([TEST_PERMIT_1]);
  });
});

describe('searchPermitsController', () => {
  const searchSpy = vi.spyOn(permitService, 'searchPermitsService');

  it('calls the service and responds 200', async () => {
    const req = {
      query: {}
    } as unknown as Request<never, never, never, SearchPermitsOptions>;

    searchSpy.mockResolvedValue({ permits: [TEST_PERMIT_1], totalRecords: 1 } as never);

    await searchPermitsController(req, res as unknown as Response<unknown, LocalContext>);

    expect(searchSpy).toHaveBeenCalledTimes(1);
    expect(searchSpy).toHaveBeenCalledWith(
      TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
      TEST_CURRENT_CONTEXT,
      TEST_CURRENT_CONTEXT.initiative,
      {}
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ permits: [TEST_PERMIT_1], totalRecords: 1 });
  });

  it('throws Problem 400 when initiative is PCNS', async () => {
    const req = {
      query: {}
    } as unknown as Request<never, never, never, SearchPermitsOptions>;

    res.locals.currentContext = {
      ...TEST_CURRENT_CONTEXT,
      initiative: Initiative.PCNS
    };

    await expect(searchPermitsController(req, res as unknown as Response<unknown, LocalContext>)).rejects.toThrow(
      Problem
    );
  });
});

describe('upsertPermitController', () => {
  const upsertSpy = vi.spyOn(permitService, 'upsertPermitService');

  it('calls the service with permit data then responds 200', async () => {
    const req = {
      body: {
        ...TEST_PERMIT_1,
        permitTracking: [],
        permitType: undefined,
        permitNote: undefined
      }
    } as unknown as Request<never, never, Permit>;

    upsertSpy.mockResolvedValue(TEST_PERMIT_1);

    await upsertPermitController(req, res as unknown as Response);

    expect(upsertSpy).toHaveBeenCalledTimes(1);
    expect(upsertSpy).toHaveBeenCalledWith(
      expect.objectContaining({ permitId: TEST_PERMIT_1.permitId }),
      undefined,
      [],
      undefined
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_PERMIT_1);
  });
});
