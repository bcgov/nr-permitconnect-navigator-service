import {
  TEST_CONTACT_1,
  TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
  TEST_CURRENT_CONTEXT,
  TEST_ENQUIRY_1,
  TEST_ENQUIRY_INTAKE
} from '#tests/unit/data/index';
import {
  createEnquiryController,
  deleteEnquiryController,
  getEnquiryController,
  listEnquiriesController,
  listRelatedEnquiriesController,
  patchEnquiryController,
  searchEnquiriesController
} from '#src/controllers/enquiry';
import * as activityService from '#src/services/activity';
import * as enquiryService from '#src/services/enquiry';

import type { Request, Response } from 'express';
import type { Mock } from 'vitest';
import type {
  CreateEnquiryResponse,
  Enquiry,
  EnquiryIntake,
  LocalContext,
  PatchEnquiryRequest,
  SearchEnquiriesRequest
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

describe('createEnquiryController', () => {
  const createEnquirySpy = vi.spyOn(enquiryService, 'createEnquiryService');
  const TEST_CREATE_ENQUIRY_RESPONSE: CreateEnquiryResponse = { ...TEST_ENQUIRY_1, contact: TEST_CONTACT_1 };

  it('calls the service with the current context and body then responds 201', async () => {
    const req = { body: TEST_ENQUIRY_INTAKE } as unknown as Request<never, never, EnquiryIntake>;

    createEnquirySpy.mockResolvedValue(TEST_CREATE_ENQUIRY_RESPONSE);

    await createEnquiryController(req, res as unknown as Response<CreateEnquiryResponse, LocalContext>);

    expect(createEnquirySpy).toHaveBeenCalledTimes(1);
    expect(createEnquirySpy).toHaveBeenCalledWith(TEST_CURRENT_CONTEXT, TEST_ENQUIRY_INTAKE);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(TEST_CREATE_ENQUIRY_RESPONSE);
  });

  it('defaults the body to an empty object when undefined', async () => {
    const req = { body: undefined } as unknown as Request<never, never, EnquiryIntake>;

    createEnquirySpy.mockResolvedValue(TEST_CREATE_ENQUIRY_RESPONSE);

    await createEnquiryController(req, res as unknown as Response<CreateEnquiryResponse, LocalContext>);

    expect(createEnquirySpy).toHaveBeenCalledWith(TEST_CURRENT_CONTEXT, {});
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(TEST_CREATE_ENQUIRY_RESPONSE);
  });
});

describe('deleteEnquiryController', () => {
  const getEnquirySpy = vi.spyOn(enquiryService, 'getEnquiryService');
  const deleteActivitySpy = vi.spyOn(activityService, 'deleteActivityService');

  it('looks up the enquiry, deletes its activity then responds 204', async () => {
    const req = { params: { enquiryId: TEST_ENQUIRY_1.enquiryId } } as unknown as Request<{ enquiryId: string }>;

    getEnquirySpy.mockResolvedValue(TEST_ENQUIRY_1);
    deleteActivitySpy.mockResolvedValue(undefined);

    await deleteEnquiryController(req, res as unknown as Response);

    expect(getEnquirySpy).toHaveBeenCalledWith(TEST_ENQUIRY_1.enquiryId);
    expect(deleteActivitySpy).toHaveBeenCalledWith(TEST_ENQUIRY_1.activityId);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalledWith();
  });
});

describe('getEnquiryController', () => {
  const getEnquirySpy = vi.spyOn(enquiryService, 'getEnquiryService');

  it('calls the service with the enquiryId then responds 200', async () => {
    const req = { params: { enquiryId: TEST_ENQUIRY_1.enquiryId } } as unknown as Request<{ enquiryId: string }>;

    getEnquirySpy.mockResolvedValue(TEST_ENQUIRY_1);

    await getEnquiryController(req, res as unknown as Response);

    expect(getEnquirySpy).toHaveBeenCalledWith(TEST_ENQUIRY_1.enquiryId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_ENQUIRY_1);
  });
});

describe('listEnquiriesController', () => {
  const listEnquiriesSpy = vi.spyOn(enquiryService, 'listEnquiriesService');

  it('calls the service with the authorization and context then responds 200', async () => {
    const req = {} as unknown as Request;
    const enquiries: Enquiry[] = [TEST_ENQUIRY_1];

    listEnquiriesSpy.mockResolvedValue(enquiries);

    await listEnquiriesController(req, res as unknown as Response<Enquiry[], LocalContext>);

    expect(listEnquiriesSpy).toHaveBeenCalledWith(TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR, TEST_CURRENT_CONTEXT);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(enquiries);
  });
});

describe('listRelatedEnquiriesController', () => {
  const listRelatedEnquiriesSpy = vi.spyOn(enquiryService, 'listRelatedEnquiriesService');

  it('calls the service with the authorization, context and activityId then responds 200', async () => {
    const req = { params: { activityId: 'ACTI1234' } } as unknown as Request<{ activityId: string }>;
    const enquiries: Enquiry[] = [TEST_ENQUIRY_1];

    listRelatedEnquiriesSpy.mockResolvedValue(enquiries);

    await listRelatedEnquiriesController(req, res as unknown as Response<Enquiry[], LocalContext>);

    expect(listRelatedEnquiriesSpy).toHaveBeenCalledWith(
      TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
      TEST_CURRENT_CONTEXT,
      'ACTI1234'
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(enquiries);
  });
});

describe('searchEnquiriesController', () => {
  const searchEnquiriesSpy = vi.spyOn(enquiryService, 'searchEnquiriesService');

  it('passes the body and initiative then responds 200', async () => {
    const req = {
      body: { enquiryId: [TEST_ENQUIRY_1.enquiryId], includeUser: true }
    } as unknown as Request<never, never, SearchEnquiriesRequest, never>;
    const enquiries: Enquiry[] = [TEST_ENQUIRY_1];

    searchEnquiriesSpy.mockResolvedValue(enquiries);

    await searchEnquiriesController(req, res as unknown as Response<Enquiry[], LocalContext>);

    expect(searchEnquiriesSpy).toHaveBeenCalledWith(
      TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
      TEST_CURRENT_CONTEXT,
      { enquiryId: [TEST_ENQUIRY_1.enquiryId], includeUser: true },
      TEST_CURRENT_CONTEXT.initiative
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(enquiries);
  });

  it('leaves includeUser undefined for an empty body (schema defaults an omitted POST body to {})', async () => {
    const req = { body: {} } as unknown as Request<never, never, SearchEnquiriesRequest, never>;
    const enquiries: Enquiry[] = [TEST_ENQUIRY_1];

    searchEnquiriesSpy.mockResolvedValue(enquiries);

    await searchEnquiriesController(req, res as unknown as Response<Enquiry[], LocalContext>);

    expect(searchEnquiriesSpy).toHaveBeenCalledWith(
      TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
      TEST_CURRENT_CONTEXT,
      { includeUser: undefined },
      TEST_CURRENT_CONTEXT.initiative
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(enquiries);
  });
});

describe('patchEnquiryController', () => {
  const updateEnquirySpy = vi.spyOn(enquiryService, 'patchEnquiryService');

  it('calls the service with the body and enquiryId then responds 200', async () => {
    const req = {
      body: { enquiryDescription: 'updated' },
      params: { enquiryId: TEST_ENQUIRY_1.enquiryId }
    } as unknown as Request<{ enquiryId: string }, never, PatchEnquiryRequest>;

    updateEnquirySpy.mockResolvedValue(TEST_ENQUIRY_1);

    await patchEnquiryController(req, res as unknown as Response);

    expect(updateEnquirySpy).toHaveBeenCalledWith(TEST_ENQUIRY_1.enquiryId, { enquiryDescription: 'updated' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_ENQUIRY_1);
  });
});
