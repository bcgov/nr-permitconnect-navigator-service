import {
  TEST_ACCESS_REQUEST_1,
  TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
  TEST_CURRENT_CONTEXT,
  TEST_IDIR_USER_1
} from '#tests/unit/data/index';
import {
  createUserAccessRequestController,
  getAccessRequestsController,
  processUserAccessRequestController
} from '#src/controllers/accessRequest';
import * as accessRequestService from '#src/services/accessRequest';

import type { Request, Response } from 'express';
import type { Mock } from 'vitest';
import type {
  AccessRequest,
  CreateUserAccessRequestRequest,
  LocalContext,
  ProcessUserAccessRequestRequest
} from '#types';

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

describe('createUserAccessRequestController', () => {
  const createSpy = vi.spyOn(accessRequestService, 'createAccessRequestService');

  it('calls service with context, authorization, request, user & responds 201 when isAdmin is false', async () => {
    const req = {
      body: {
        accessRequest: TEST_ACCESS_REQUEST_1,
        user: TEST_IDIR_USER_1
      }
    } as unknown as Request<never, never, CreateUserAccessRequestRequest>;

    createSpy.mockResolvedValue({ isAdmin: false, data: TEST_ACCESS_REQUEST_1 } as never);

    await createUserAccessRequestController(req, res as unknown as Response<unknown, LocalContext>);

    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(createSpy).toHaveBeenCalledWith(
      TEST_CURRENT_CONTEXT,
      TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
      TEST_ACCESS_REQUEST_1,
      TEST_IDIR_USER_1
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(TEST_ACCESS_REQUEST_1);
  });

  it('calls the service and responds 200 when isAdmin is true', async () => {
    const req = {
      body: {
        accessRequest: TEST_ACCESS_REQUEST_1,
        user: TEST_IDIR_USER_1
      }
    } as unknown as Request<never, never, CreateUserAccessRequestRequest>;

    createSpy.mockResolvedValue({ isAdmin: true, data: TEST_ACCESS_REQUEST_1 } as never);

    await createUserAccessRequestController(req, res as unknown as Response<unknown, LocalContext>);

    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_ACCESS_REQUEST_1);
  });
});

describe('processUserAccessRequestController', () => {
  const processSpy = vi.spyOn(accessRequestService, 'processAccessRequestService');

  it('calls the service with context, accessRequestId and approve then responds 204', async () => {
    const req = {
      params: { accessRequestId: TEST_ACCESS_REQUEST_1.accessRequestId },
      body: { approve: true }
    } as unknown as Request<{ accessRequestId: string }, never, ProcessUserAccessRequestRequest>;

    processSpy.mockResolvedValue(undefined);

    await processUserAccessRequestController(req, res as unknown as Response<unknown, LocalContext>);

    expect(processSpy).toHaveBeenCalledTimes(1);
    expect(processSpy).toHaveBeenCalledWith(TEST_CURRENT_CONTEXT, TEST_ACCESS_REQUEST_1.accessRequestId, true);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalledWith();
  });

  it('calls the service with approve false', async () => {
    const req = {
      params: { accessRequestId: TEST_ACCESS_REQUEST_1.accessRequestId },
      body: { approve: false }
    } as unknown as Request<{ accessRequestId: string }, never, ProcessUserAccessRequestRequest>;

    processSpy.mockResolvedValue(undefined);

    await processUserAccessRequestController(req, res as unknown as Response<unknown, LocalContext>);

    expect(processSpy).toHaveBeenCalledWith(TEST_CURRENT_CONTEXT, TEST_ACCESS_REQUEST_1.accessRequestId, false);
    expect(res.status).toHaveBeenCalledWith(204);
  });
});

describe('getAccessRequestsController', () => {
  const getSpy = vi.spyOn(accessRequestService, 'getAccessRequestsService');

  it('calls the service with the current initiative then responds 200', async () => {
    const req = {} as unknown as Request;
    const accessRequests: AccessRequest[] = [TEST_ACCESS_REQUEST_1];

    getSpy.mockResolvedValue(accessRequests);

    await getAccessRequestsController(req, res as unknown as Response<AccessRequest[], LocalContext>);

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith(TEST_CURRENT_CONTEXT.initiative);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(accessRequests);
  });
});
