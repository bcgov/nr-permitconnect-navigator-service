import { TEST_CURRENT_CONTEXT } from '#tests/unit/data/index';
import { createAtsClientController, createAtsEnquiryController, searchAtsUsersController } from '#src/controllers/ats';
import * as atsExternal from '#src/external/ats';

import type { Request, Response } from 'express';
import type { Mock } from 'vitest';
import type { CreateAtsClientRequest, CreateAtsEnquiryRequest, LocalContext, SearchAtsUsersRequest } from '#types';

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
  res.locals.currentContext = TEST_CURRENT_CONTEXT;
  vi.clearAllMocks();
});

describe('createAtsClientController', () => {
  it('should call createAtsClient with body and currentContext, respond with status and data', async () => {
    const mockResp = { status: 201, data: { clientId: 'ats-123' } };
    vi.spyOn(atsExternal, 'createAtsClient').mockResolvedValueOnce(mockResp);

    const body = { clientName: 'Test Client' } as unknown as CreateAtsClientRequest;
    const req = { body } as unknown as Request<never, never, CreateAtsClientRequest, never>;

    await createAtsClientController(req, res as unknown as Response<unknown, LocalContext>);

    expect(atsExternal.createAtsClient).toHaveBeenCalledTimes(1);
    expect(atsExternal.createAtsClient).toHaveBeenCalledWith(body, TEST_CURRENT_CONTEXT);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ clientId: 'ats-123' });
  });
});

describe('createAtsEnquiryController', () => {
  it('should call createAtsEnquiry with body and currentContext, respond with status and data', async () => {
    const mockResp = { status: 201, data: { enquiryId: 'enq-123' } };
    vi.spyOn(atsExternal, 'createAtsEnquiry').mockResolvedValueOnce(mockResp);

    const body = { enquiryData: 'test' } as unknown as CreateAtsEnquiryRequest;
    const req = { body } as unknown as Request<never, never, CreateAtsEnquiryRequest, never>;

    await createAtsEnquiryController(req, res as unknown as Response<unknown, LocalContext>);

    expect(atsExternal.createAtsEnquiry).toHaveBeenCalledTimes(1);
    expect(atsExternal.createAtsEnquiry).toHaveBeenCalledWith(body, TEST_CURRENT_CONTEXT);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ enquiryId: 'enq-123' });
  });
});

describe('searchAtsUsersController', () => {
  it('should call searchAtsUsers with query params and respond with status and data', async () => {
    const mockResp = { status: 200, data: [{ id: 'user-1', name: 'Test User' }] };
    vi.spyOn(atsExternal, 'searchAtsUsers').mockResolvedValueOnce(mockResp);

    const query = { firstName: 'John' } as unknown as SearchAtsUsersRequest;
    const req = { query } as unknown as Request<never, never, never, SearchAtsUsersRequest>;

    await searchAtsUsersController(req, res as unknown as Response<unknown, LocalContext>);

    expect(atsExternal.searchAtsUsers).toHaveBeenCalledTimes(1);
    expect(atsExternal.searchAtsUsers).toHaveBeenCalledWith(query);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ id: 'user-1', name: 'Test User' }]);
  });
});
