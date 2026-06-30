import { Prisma } from '@prisma/client';

import {
  TEST_CONTACT_1,
  TEST_CURRENT_CONTEXT,
  TEST_ACTIVITY_ELECTRIFICATION,
  TEST_ENQUIRY_1,
  TEST_ENQUIRY_INTAKE,
  TEST_HOUSING_PROJECT_1
} from '../data/index.ts';
import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import {
  createEnquiryController,
  deleteEnquiryController,
  getEnquiriesController,
  getEnquiryController,
  listRelatedEnquiriesController,
  searchEnquiriesController,
  updateEnquiryController
} from '../../../src/controllers/enquiry.ts';
import * as resposeFiltering from '../../../src/parsers/responseFiltering.ts';
import * as activityService from '../../../src/services/activity.ts';
import * as activityContactService from '../../../src/services/activityContact.ts';
import * as contactService from '../../../src/services/contact.ts';
import * as enquiryService from '../../../src/services/enquiry.ts';
import * as projectService from '../../../src/services/project.ts';
import { Initiative } from '../../../src/utils/enums/application.ts';
import { ActivityContactRole } from '../../../src/utils/enums/projectCommon.ts';

import type { Request, Response } from 'express';
import type { Mock } from 'vitest';
import type {
  ActivityContact,
  Enquiry,
  EnquiryIntake,
  EnquirySearchParameters,
  LocalContext
} from '../../../src/types/index.ts';

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
});

afterEach(() => {
  vi.resetAllMocks();
});

// Set an initiative for the context
TEST_CURRENT_CONTEXT.initiative = Initiative.ELECTRIFICATION;

describe('createEnquiryController', () => {
  const createActivitySpy = vi.spyOn(activityService, 'createActivity');
  const searchContactsSpy = vi.spyOn(contactService, 'searchContacts');
  const createActivityContactSpy = vi.spyOn(activityContactService, 'createActivityContact');
  const listActivityContactsSpy = vi.spyOn(activityContactService, 'listActivityContacts');
  const upsertContactsSpy = vi.spyOn(contactService, 'upsertContacts');
  const createEnquirySpy = vi.spyOn(enquiryService, 'createEnquiry');
  const getProjectByActivityIdSpy = vi.spyOn(projectService, 'getProjectByActivityId');

  it('should call services and respond with 201 and result', async () => {
    const req = {
      body: TEST_ENQUIRY_INTAKE
    };

    const PROJECT_WITH_PROJECTID = {
      ...TEST_HOUSING_PROJECT_1,
      projectId: TEST_HOUSING_PROJECT_1.housingProjectId
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
    upsertContactsSpy.mockResolvedValue([TEST_CONTACT_1]);
    createEnquirySpy.mockResolvedValue(TEST_ENQUIRY_1);
    getProjectByActivityIdSpy.mockResolvedValue(PROJECT_WITH_PROJECTID);

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
    expect(res.json).toHaveBeenCalledWith({ ...TEST_ENQUIRY_1, contact: TEST_CONTACT_1 });
  });
});

describe('deleteEnquiryController', () => {
  const deleteEnquirySpy = vi.spyOn(enquiryService, 'deleteEnquiry');
  const deleteActivitySpy = vi.spyOn(activityService, 'deleteActivity');

  it('should call services and respond with 204', async () => {
    const req = {
      params: { enquiryId: 'ff5db6e3-3bd4-4a5c-b001-aa5ae3d72211' }
    };

    deleteEnquirySpy.mockResolvedValue(TEST_ENQUIRY_1);
    deleteActivitySpy.mockResolvedValue();

    await deleteEnquiryController(req as unknown as Request<{ enquiryId: string }>, res as unknown as Response);

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
  const getEnquiriesSpy = vi.spyOn(enquiryService, 'getEnquiries');
  const filterSpy = vi.spyOn(resposeFiltering, 'filterActivityResponseByScope');

  it('should call services and respond with 200 and result', async () => {
    const req = {} as unknown as Request;

    const enquiries: Enquiry[] = [TEST_ENQUIRY_1];
    getEnquiriesSpy.mockResolvedValue(enquiries);
    filterSpy.mockResolvedValue(enquiries);

    await getEnquiriesController(req, res as unknown as Response<Enquiry[], LocalContext>);

    expect(getEnquiriesSpy).toHaveBeenCalledWith(prismaTxMock);
    expect(filterSpy).toHaveBeenCalledTimes(1);
    expect(filterSpy).toHaveBeenCalledWith(prismaTxMock, res.locals, enquiries);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(enquiries);
  });
});

describe('getEnquiryController', () => {
  const getEnquirySpy = vi.spyOn(enquiryService, 'getEnquiry');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      params: { enquiryId: 'ff5db6e3-3bd4-4a5c-b001-aa5ae3d72211' }
    } as unknown as Request<{ enquiryId: string }>;

    getEnquirySpy.mockResolvedValue(TEST_ENQUIRY_1);

    await getEnquiryController(req, res as unknown as Response);

    expect(getEnquirySpy).toHaveBeenCalledWith(prismaTxMock, 'ff5db6e3-3bd4-4a5c-b001-aa5ae3d72211');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_ENQUIRY_1);
  });
});

describe('listRelatedEnquiriesController', () => {
  const getRelatedEnquiriesSpy = vi.spyOn(enquiryService, 'getRelatedEnquiries');
  const filterSpy = vi.spyOn(resposeFiltering, 'filterActivityResponseByScope');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      params: { activityId: 'ACTI1234' }
    };

    const relatedEnquiries: Enquiry[] = [TEST_ENQUIRY_1];
    getRelatedEnquiriesSpy.mockResolvedValue(relatedEnquiries);
    filterSpy.mockResolvedValue(relatedEnquiries);

    await listRelatedEnquiriesController(
      req as unknown as Request<{ activityId: string }>,
      res as unknown as Response<Enquiry[], LocalContext>
    );

    expect(getRelatedEnquiriesSpy).toHaveBeenCalledWith(prismaTxMock, 'ACTI1234');
    expect(filterSpy).toHaveBeenCalledTimes(1);
    expect(filterSpy).toHaveBeenCalledWith(prismaTxMock, res.locals, relatedEnquiries);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(relatedEnquiries);
  });
});

describe('searchEnquiriesController', () => {
  const searchEnquiriesSpy = vi.spyOn(enquiryService, 'searchEnquiries');
  const filterSpy = vi.spyOn(resposeFiltering, 'filterActivityResponseByScope');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      body: { enquiryId: ['ff5db6e3-3bd4-4a5c-b001-aa5ae3d72211'], includeUser: true }
    } as unknown as Request<never, never, EnquirySearchParameters, never>;

    const enquiries: Enquiry[] = [TEST_ENQUIRY_1];
    searchEnquiriesSpy.mockResolvedValue(enquiries);
    filterSpy.mockResolvedValue(enquiries);

    await searchEnquiriesController(req, res as unknown as Response<Enquiry[], LocalContext>);

    expect(searchEnquiriesSpy).toHaveBeenCalledWith(
      prismaTxMock,
      {
        enquiryId: ['ff5db6e3-3bd4-4a5c-b001-aa5ae3d72211'],
        includeUser: true
      },
      Initiative.ELECTRIFICATION
    );
    expect(filterSpy).toHaveBeenCalledTimes(1);
    expect(filterSpy).toHaveBeenCalledWith(prismaTxMock, res.locals, enquiries);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(enquiries);
  });
});

describe('updateEnquiryController', () => {
  const updateEnquirySpy = vi.spyOn(enquiryService, 'updateEnquiry');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      body: { ...TEST_ENQUIRY_1 },
      params: { enquiryId: TEST_ENQUIRY_1.enquiryId }
    };

    updateEnquirySpy.mockResolvedValue(TEST_ENQUIRY_1);

    await updateEnquiryController(
      req as unknown as Request<{ enquiryId: string }, never, Omit<Prisma.enquiryUpdateInput, 'enquiryId'>>,
      res as unknown as Response
    );

    expect(updateEnquirySpy).toHaveBeenCalledWith(
      prismaTxMock,
      {
        ...TEST_ENQUIRY_1,
        updatedAt: expect.any(Date) as Date,
        updatedBy: TEST_CURRENT_CONTEXT.userId
      },
      req.params.enquiryId
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_ENQUIRY_1);
  });
});
