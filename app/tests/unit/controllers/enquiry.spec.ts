import {
  createEnquiryController,
  getEnquiriesController,
  getEnquiryController,
  listRelatedEnquiriesController,
  searchEnquiriesController,
  updateEnquiryController,
  updateEnquiryIsDeletedFlagController
} from '../../../src/controllers/enquiry';
import * as activityService from '../../../src/services/activity';
import * as enquiryService from '../../../src/services/enquiry';
import * as contactService from '../../../src/services/contact';
import { Initiative } from '../../../src/utils/enums/application';

import type { Request, Response } from 'express';
import type { Enquiry, EnquiryIntake, EnquirySearchParameters } from '../../../src/types';
import { TEST_CURRENT_CONTEXT, TEST_ELECTRIFICATION_ACTIVITY, TEST_ENQUIRY_1, TEST_ENQUIRY_INTAKE } from '../data';
import { prismaTxMock } from '../../__mocks__/prismaMock';

// Mock config library - @see {@link https://stackoverflow.com/a/64819698}
jest.mock('config');

const mockResponse = () => {
  const res: { status?: jest.Mock; json?: jest.Mock; end?: jest.Mock } = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};

let res: { status?: jest.Mock; json?: jest.Mock; end?: jest.Mock };
beforeEach(() => {
  res = mockResponse();
});

afterEach(() => {
  jest.resetAllMocks();
});

// Set an initiative for the context
TEST_CURRENT_CONTEXT.initiative = Initiative.ELECTRIFICATION;

describe('createEnquiryController', () => {
  const createActivitySpy = jest.spyOn(activityService, 'createActivity');
  const upsertContactsSpy = jest.spyOn(contactService, 'upsertContacts');
  const createEnquirySpy = jest.spyOn(enquiryService, 'createEnquiry');

  it('should call services and respond with 201 and result', async () => {
    const req = {
      body: TEST_ENQUIRY_INTAKE,
      currentContext: TEST_CURRENT_CONTEXT
    };

    createActivitySpy.mockResolvedValue(TEST_ELECTRIFICATION_ACTIVITY);
    createEnquirySpy.mockResolvedValue(TEST_ENQUIRY_1);

    await createEnquiryController(req as unknown as Request<never, never, EnquiryIntake>, res as unknown as Response);

    expect(createActivitySpy).toHaveBeenCalledTimes(1);
    expect(createActivitySpy).toHaveBeenCalledWith(prismaTxMock, Initiative.ELECTRIFICATION, {
      createdAt: expect.any(Date),
      createdBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(upsertContactsSpy).toHaveBeenCalledWith(prismaTxMock, TEST_ENQUIRY_INTAKE.contacts);
    expect(createEnquirySpy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(TEST_ENQUIRY_1);
  });
});

describe('getEnquiriesController', () => {
  const getEnquiriesSpy = jest.spyOn(enquiryService, 'getEnquiries');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      currentContext: TEST_CURRENT_CONTEXT,
      currentAuthorization: { attributes: [] }
    } as unknown as Request;

    const enquiries: Enquiry[] = [TEST_ENQUIRY_1];
    getEnquiriesSpy.mockResolvedValue(enquiries);

    await getEnquiriesController(req as unknown as Request, res as unknown as Response);

    expect(getEnquiriesSpy).toHaveBeenCalledWith(prismaTxMock);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(enquiries);
  });
});

describe('getEnquiryController', () => {
  const getEnquirySpy = jest.spyOn(enquiryService, 'getEnquiry');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      params: { enquiryId: 'ff5db6e3-3bd4-4a5c-b001-aa5ae3d72211' },
      currentContext: TEST_CURRENT_CONTEXT
    } as unknown as Request<{ enquiryId: string }>;

    getEnquirySpy.mockResolvedValue(TEST_ENQUIRY_1);

    await getEnquiryController(req as unknown as Request<{ enquiryId: string }>, res as unknown as Response);

    expect(getEnquirySpy).toHaveBeenCalledWith(prismaTxMock, 'ff5db6e3-3bd4-4a5c-b001-aa5ae3d72211');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_ENQUIRY_1);
  });
});

describe('listRelatedEnquiriesController', () => {
  const getRelatedEnquiriesSpy = jest.spyOn(enquiryService, 'getRelatedEnquiries');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      params: { activityId: 'ACTI1234' }
    };

    const relatedEnquiries: Enquiry[] = [TEST_ENQUIRY_1];
    getRelatedEnquiriesSpy.mockResolvedValue(relatedEnquiries);

    await listRelatedEnquiriesController(req as unknown as Request<{ activityId: string }>, res as unknown as Response);

    expect(getRelatedEnquiriesSpy).toHaveBeenCalledWith(prismaTxMock, 'ACTI1234');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(relatedEnquiries);
  });
});

describe('searchEnquiriesController', () => {
  const searchEnquiriesSpy = jest.spyOn(enquiryService, 'searchEnquiries');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      query: { enquiryId: ['ff5db6e3-3bd4-4a5c-b001-aa5ae3d72211'], includeUser: true },
      currentContext: TEST_CURRENT_CONTEXT,
      currentAuthorization: { attributes: [] }
    } as unknown as Request<never, never, never, EnquirySearchParameters>;

    const enquiries: Enquiry[] = [TEST_ENQUIRY_1];
    searchEnquiriesSpy.mockResolvedValue(enquiries);

    await searchEnquiriesController(
      req as unknown as Request<never, never, never, EnquirySearchParameters>,
      res as unknown as Response
    );

    expect(searchEnquiriesSpy).toHaveBeenCalledWith(
      prismaTxMock,
      {
        enquiryId: ['ff5db6e3-3bd4-4a5c-b001-aa5ae3d72211'],
        includeUser: true
      },
      Initiative.ELECTRIFICATION
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(enquiries);
  });
});

describe('updateEnquiryController', () => {
  const updateEnquirySpy = jest.spyOn(enquiryService, 'updateEnquiry');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      body: { ...TEST_ENQUIRY_1 },
      currentContext: TEST_CURRENT_CONTEXT
    };

    updateEnquirySpy.mockResolvedValue(TEST_ENQUIRY_1);

    await updateEnquiryController(req as unknown as Request<never, never, Enquiry>, res as unknown as Response);

    expect(updateEnquirySpy).toHaveBeenCalledWith(prismaTxMock, {
      ...TEST_ENQUIRY_1,
      updatedAt: expect.any(Date),
      updatedBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_ENQUIRY_1);
  });
});

describe('updateEnquiryIsDeletedFlagController', () => {
  const updateIsDeletedFlagSpy = jest.spyOn(enquiryService, 'updateEnquiryIsDeletedFlag');

  it('should call services and respond with 204', async () => {
    const req = {
      params: { enquiryId: 'ff5db6e3-3bd4-4a5c-b001-aa5ae3d72211' },
      body: { isDeleted: true },
      currentContext: TEST_CURRENT_CONTEXT
    };

    updateIsDeletedFlagSpy.mockResolvedValue(TEST_ENQUIRY_1);

    await updateEnquiryIsDeletedFlagController(
      req as unknown as Request<{ enquiryId: string }, never, { isDeleted: boolean }>,
      res as unknown as Response
    );

    expect(updateIsDeletedFlagSpy).toHaveBeenCalledWith(
      prismaTxMock,
      'ff5db6e3-3bd4-4a5c-b001-aa5ae3d72211',
      true,
      expect.any(Object)
    );
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalledWith();
  });
});
