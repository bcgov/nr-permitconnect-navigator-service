import {
  createEnquiryController,
  deleteEnquiryController,
  getEnquiriesController,
  getEnquiryController,
  listRelatedEnquiriesController,
  searchEnquiriesController,
  updateEnquiryController
} from '../../../src/controllers/enquiry.ts';
import * as activityService from '../../../src/services/activity.ts';
import * as activityContactService from '../../../src/services/activityContact.ts';
import * as enquiryService from '../../../src/services/enquiry.ts';
import * as contactService from '../../../src/services/contact.ts';
import { Initiative } from '../../../src/utils/enums/application.ts';

import type { Request, Response } from 'express';
import type { ActivityContact, Enquiry, EnquiryIntake, EnquirySearchParameters } from '../../../src/types/index.ts';
import {
  TEST_CONTACT_1,
  TEST_CURRENT_CONTEXT,
  TEST_ACTIVITY_ELECTRIFICATION,
  TEST_ENQUIRY_1,
  TEST_ENQUIRY_INTAKE
} from '../data/index.ts';
import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import { ActivityContactRole } from '../../../src/utils/enums/projectCommon.ts';

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
  const searchContactsSpy = jest.spyOn(contactService, 'searchContacts');
  const createActivityContactSpy = jest.spyOn(activityContactService, 'createActivityContact');
  const listActivityContactsSpy = jest.spyOn(activityContactService, 'listActivityContacts');
  const upsertContactsSpy = jest.spyOn(contactService, 'upsertContacts');
  const createEnquirySpy = jest.spyOn(enquiryService, 'createEnquiry');

  it('should call services and respond with 201 and result', async () => {
    const req = {
      body: TEST_ENQUIRY_INTAKE,
      currentContext: TEST_CURRENT_CONTEXT
    };

    createActivitySpy.mockResolvedValue(TEST_ACTIVITY_ELECTRIFICATION);
    searchContactsSpy.mockResolvedValue([TEST_CONTACT_1]);
    createActivityContactSpy.mockResolvedValue({
      activityId: TEST_ACTIVITY_ELECTRIFICATION.activityId,
      contactId: TEST_CONTACT_1.contactId
    } as ActivityContact);
    listActivityContactsSpy.mockResolvedValue([
      {
        activityId: TEST_ACTIVITY_ELECTRIFICATION.activityId,
        contactId: TEST_CONTACT_1.contactId
      } as ActivityContact
    ]);
    createEnquirySpy.mockResolvedValue(TEST_ENQUIRY_1);

    await createEnquiryController(req as unknown as Request<never, never, EnquiryIntake>, res as unknown as Response);

    expect(createActivitySpy).toHaveBeenCalledTimes(1);
    expect(createActivitySpy).toHaveBeenCalledWith(prismaTxMock, Initiative.ELECTRIFICATION, {
      createdAt: expect.any(Date) as Date,
      createdBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(searchContactsSpy).toHaveBeenCalledTimes(2);
    expect(searchContactsSpy).toHaveBeenCalledWith(prismaTxMock, {
      userId: [TEST_CURRENT_CONTEXT.userId]
    });
    expect(createActivityContactSpy).toHaveBeenCalledTimes(1);
    expect(createActivityContactSpy).toHaveBeenCalledWith(
      prismaTxMock,
      TEST_ACTIVITY_ELECTRIFICATION.activityId,
      TEST_CONTACT_1.contactId,
      ActivityContactRole.PRIMARY
    );
    expect(upsertContactsSpy).toHaveBeenCalledWith(prismaTxMock, [
      { ...TEST_ENQUIRY_INTAKE.contact, updatedAt: expect.any(Date) as Date, updatedBy: TEST_CURRENT_CONTEXT.userId }
    ]);
    expect(createEnquirySpy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(TEST_ENQUIRY_1);
  });
});

describe('deleteEnquiryController', () => {
  const getEnquirySpy = jest.spyOn(enquiryService, 'getEnquiry');
  const deleteEnquirySpy = jest.spyOn(enquiryService, 'deleteEnquiry');
  const deleteActivitySpy = jest.spyOn(activityService, 'deleteActivity');

  it('should call services and respond with 204', async () => {
    const req = {
      params: { enquiryId: 'ff5db6e3-3bd4-4a5c-b001-aa5ae3d72211' },
      currentContext: TEST_CURRENT_CONTEXT
    };

    getEnquirySpy.mockResolvedValue(TEST_ENQUIRY_1);
    deleteActivitySpy.mockResolvedValue();

    await deleteEnquiryController(req as unknown as Request<{ enquiryId: string }>, res as unknown as Response);

    expect(getEnquirySpy).toHaveBeenCalledTimes(1);
    expect(getEnquirySpy).toHaveBeenCalledWith(prismaTxMock, req.params.enquiryId);
    expect(deleteEnquirySpy).toHaveBeenCalledTimes(1);
    expect(deleteEnquirySpy).toHaveBeenCalledWith(prismaTxMock, req.params.enquiryId, {
      deletedAt: expect.any(Date) as Date,
      deletedBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(deleteActivitySpy).toHaveBeenCalledTimes(1);
    expect(deleteActivitySpy).toHaveBeenCalledWith(prismaTxMock, TEST_ENQUIRY_1.activityId, {
      deletedAt: expect.any(Date) as Date,
      deletedBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalledWith();
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
      updatedAt: expect.any(Date) as Date,
      updatedBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_ENQUIRY_1);
  });
});
