import {
  createEnquiryController,
  getEnquiriesController,
  getEnquiryController,
  listRelatedEnquiriesController,
  searchEnquiriesController,
  updateEnquiryController,
  updateEnquiryIsDeletedFlagController
} from '../../../src/controllers/enquiry';
import * as activityContactService from '../../../src/services/activityContact';
import * as enquiryService from '../../../src/services/enquiry';
import * as contactService from '../../../src/services/contact';
import { Initiative } from '../../../src/utils/enums/application';
import {
  EnquirySubmittedMethod,
  ApplicationStatus,
  ProjectRelationship,
  ContactPreference
} from '../../../src/utils/enums/projectCommon';

import type { Request, Response } from 'express';
import type { Contact, Enquiry, EnquiryIntake, EnquirySearchParameters } from '../../../src/types';

jest.mock('config');

const CONTACT_DATA: Contact = {
  contactId: 'contact123',
  userId: 'user123',
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '123-456-7890',
  email: 'john.doe@example.com',
  contactPreference: ContactPreference.EITHER,
  contactApplicantRelationship: ProjectRelationship.OWNER,
  createdAt: null,
  createdBy: null,
  updatedAt: null,
  updatedBy: null
};

const ENQUIRY_DATA: Enquiry = {
  enquiryId: 'enquiry123',
  activityId: 'activity123',
  addedToAts: false,
  assignedUserId: null,
  atsClientId: null,
  atsEnquiryId: null,
  submissionType: 'general',
  submittedAt: new Date(),
  submittedBy: 'testuser',
  relatedActivityId: 'activity123',
  enquiryDescription: 'Test enquiry description',
  submittedMethod: EnquirySubmittedMethod.PHONE,
  intakeStatus: 'submitted',
  enquiryStatus: 'new',
  waitingOn: null,
  createdAt: null,
  createdBy: null,
  updatedAt: null,
  updatedBy: null,
  activity: {
    activityId: 'activity123',
    initiativeId: Initiative.HOUSING,
    isDeleted: false,
    createdAt: null,
    createdBy: null,
    updatedAt: null,
    updatedBy: null,
    activityContact: [
      {
        activityId: 'activity123',
        contactId: CONTACT_DATA.contactId,
        createdAt: null,
        createdBy: null,
        updatedAt: null,
        updatedBy: null
      }
    ]
  },

  user: null
};

const GENERATE_ENQUIRY_DATA = {
  enquiryId: 'enquiry123',
  activityId: 'activity123',
  submittedAt: '2025-02-28T00:00:00.000Z',
  submittedBy: 'testuser',
  intakeStatus: 'submitted',
  enquiryStatus: ApplicationStatus.NEW,
  submissionType: 'general',
  relatedActivityId: 'activity123',
  enquiryDescription: 'Test enquiry description'
};

const ENQUIRY_INTAKE_DATA: EnquiryIntake = {
  contacts: [CONTACT_DATA],
  basic: {
    submissionType: 'general',
    relatedActivityId: 'activity123',
    enquiryDescription: 'Test enquiry description'
  }
};

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

let res = mockResponse();
beforeEach(() => {
  res = mockResponse();
});

afterEach(() => {
  jest.resetAllMocks();
});

const CURRENT_CONTEXT = { authType: 'BEARER', tokenPayload: null, initiative: Initiative.PCNS };

describe('enquiryController', () => {
  const next = jest.fn();

  describe('createEnquiryController', () => {
    const upsertContactsSpy = jest.spyOn(contactService, 'upsertContacts');
    const createEnquirySpy = jest.spyOn(enquiryService, 'createEnquiry');
    //const generateEnquiryDataSpy = jest.spyOn(enquiryController, 'generateEnquiryData');

    it('should return 201 if enquiry is created successfully', async () => {
      const req = {
        body: ENQUIRY_INTAKE_DATA,
        currentContext: CURRENT_CONTEXT
      } as unknown as Request<never, never, EnquiryIntake>;

      //generateEnquiryDataSpy.mockResolvedValue(GENERATE_ENQUIRY_DATA);
      createEnquirySpy.mockResolvedValue(ENQUIRY_DATA);

      await createEnquiryController(req, res);

      //expect(generateEnquiryDataSpy).toHaveBeenCalled();
      expect(upsertContactsSpy).toHaveBeenCalledWith(
        ENQUIRY_INTAKE_DATA.contacts,
        CURRENT_CONTEXT,
        ENQUIRY_DATA.activityId
      );
      expect(createEnquirySpy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(ENQUIRY_DATA);
    });

    it('calls next if the enquiry service fails to create enquiry', async () => {
      const req = {
        body: ENQUIRY_INTAKE_DATA,
        currentContext: CURRENT_CONTEXT
      } as unknown as Request<never, never, EnquiryIntake>;

      //generateEnquiryDataSpy.mockResolvedValue(GENERATE_ENQUIRY_DATA);
      createEnquirySpy.mockImplementationOnce(() => {
        throw new Error('failure');
      });

      await createEnquiryController(req, res);

      //expect(generateEnquiryDataSpy).toHaveBeenCalled();
      expect(createEnquirySpy).toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('getEnquiriesController', () => {
    const getEnquiriesSpy = jest.spyOn(enquiryService, 'getEnquiries');

    it('should return 200 with enquiries', async () => {
      const req = {
        currentContext: CURRENT_CONTEXT,
        currentAuthorization: { attributes: [] }
      } as unknown as Request;

      const enquiries: Enquiry[] = [ENQUIRY_DATA];
      getEnquiriesSpy.mockResolvedValue(enquiries);

      await getEnquiriesController(req, res);

      expect(getEnquiriesSpy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(enquiries);
    });

    it('calls next if the enquiry service fails', async () => {
      const req = { currentContext: CURRENT_CONTEXT } as unknown as Request;
      getEnquiriesSpy.mockImplementationOnce(() => {
        throw new Error();
      });

      await getEnquiriesController(req, res);

      expect(getEnquiriesSpy).toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('getEnquiryController', () => {
    const getEnquirySpy = jest.spyOn(enquiryService, 'getEnquiry');

    it('should return 200 if enquiry is found', async () => {
      const req = {
        params: { enquiryId: 'enquiry123' },
        currentContext: CURRENT_CONTEXT
      } as unknown as Request<{ enquiryId: string }>;

      getEnquirySpy.mockResolvedValue(ENQUIRY_DATA);

      await getEnquiryController(req, res);

      expect(getEnquirySpy).toHaveBeenCalledWith('enquiry123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(ENQUIRY_DATA);
    });

    it('should return 404 if enquiry is not found', async () => {
      const req = {
        params: { enquiryId: 'enquiry123' },
        currentContext: CURRENT_CONTEXT
      } as unknown as Request<{ enquiryId: string }>;

      getEnquirySpy.mockResolvedValue(null as unknown as Enquiry);

      await getEnquiryController(req, res);

      expect(getEnquirySpy).toHaveBeenCalledWith('enquiry123');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Enquiry not found' });
    });

    it('calls next if the enquiry service fails', async () => {
      const req = {
        params: { enquiryId: 'enquiry123' },
        currentContext: CURRENT_CONTEXT
      } as unknown as Request<{ enquiryId: string }>;

      getEnquirySpy.mockImplementationOnce(() => {
        throw new Error();
      });

      await getEnquiryController(req, res);

      expect(getEnquirySpy).toHaveBeenCalledWith('enquiry123');
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('listRelatedEnquiriesController', () => {
    const getRelatedEnquiriesSpy = jest.spyOn(enquiryService, 'getRelatedEnquiries');

    it('should return 200 with related enquiries', async () => {
      const req = {
        params: { activityId: 'activity123' }
      } as unknown as Request<{ activityId: string }>;

      const relatedEnquiries: Enquiry[] = [ENQUIRY_DATA];
      getRelatedEnquiriesSpy.mockResolvedValue(relatedEnquiries);

      await listRelatedEnquiriesController(req, res);

      expect(getRelatedEnquiriesSpy).toHaveBeenCalledWith('activity123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(relatedEnquiries);
    });

    it('calls next if the enquiry service fails', async () => {
      const req = {
        params: { activityId: 'activity123' }
      } as unknown as Request<{ activityId: string }>;

      getRelatedEnquiriesSpy.mockImplementationOnce(() => {
        throw new Error();
      });

      await listRelatedEnquiriesController(req, res);

      expect(getRelatedEnquiriesSpy).toHaveBeenCalledWith('activity123');
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('searchEnquiriesController', () => {
    const searchEnquiriesSpy = jest.spyOn(enquiryService, 'searchEnquiries');

    it('should return 200 if search is successful', async () => {
      const req = {
        query: { enquiryId: ['enquiry123'], includeUser: true },
        currentContext: CURRENT_CONTEXT,
        currentAuthorization: { attributes: [] }
      } as unknown as Request<never, never, never, EnquirySearchParameters>;

      const enquiries: Enquiry[] = [ENQUIRY_DATA];
      searchEnquiriesSpy.mockResolvedValue(enquiries);

      await searchEnquiriesController(req, res);

      expect(searchEnquiriesSpy).toHaveBeenCalledWith(
        {
          enquiryId: ['enquiry123'],
          includeUser: true
        },
        Initiative.PCNS
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(enquiries);
    });

    it('calls next if the enquiry service fails', async () => {
      const req = {
        query: { enquiryId: ['enquiry123'], includeUser: true },
        currentContext: CURRENT_CONTEXT,
        currentAuthorization: { attributes: [] }
      } as unknown as Request<never, never, never, EnquirySearchParameters>;

      searchEnquiriesSpy.mockImplementationOnce(() => {
        throw new Error();
      });

      await searchEnquiriesController(req, res);

      expect(searchEnquiriesSpy).toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateEnquiryController', () => {
    const insertContacts = jest.spyOn(contactService, 'insertContacts');
    const deleteUnmatchedActivityContacts = jest.spyOn(activityContactService, 'deleteUnmatchedActivityContacts');
    const upsertActivityContacts = jest.spyOn(activityContactService, 'upsertActivityContacts');
    const updateEnquirySpy = jest.spyOn(enquiryService, 'updateEnquiry');

    it('should return 200 if enquiry is updated successfully', async () => {
      const req = {
        body: { ...ENQUIRY_DATA },
        currentContext: CURRENT_CONTEXT
      } as unknown as Request<never, never, Enquiry>;

      updateEnquirySpy.mockResolvedValue(ENQUIRY_DATA);

      await updateEnquiryController(req, res);

      expect(insertContacts).toHaveBeenCalled();
      expect(deleteUnmatchedActivityContacts).toHaveBeenCalledTimes(1);
      expect(upsertActivityContacts).toHaveBeenCalledTimes(1);
      expect(updateEnquirySpy).toHaveBeenCalledWith(expect.objectContaining(ENQUIRY_DATA));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(ENQUIRY_DATA);
    });

    it('should return 404 if updateEnquiry returns null', async () => {
      const req = {
        body: { ...ENQUIRY_DATA },
        currentContext: CURRENT_CONTEXT
      } as unknown as Request<never, never, Enquiry>;

      updateEnquirySpy.mockResolvedValue(null as unknown as Enquiry);

      await updateEnquiryController(req, res);

      expect(insertContacts).toHaveBeenCalled();
      expect(deleteUnmatchedActivityContacts).toHaveBeenCalledTimes(1);
      expect(upsertActivityContacts).toHaveBeenCalledTimes(1);
      expect(updateEnquirySpy).toHaveBeenCalledWith(expect.objectContaining(ENQUIRY_DATA));
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Enquiry not found' });
    });

    it('calls next if the enquiry service fails', async () => {
      const req = {
        body: { ...ENQUIRY_DATA },
        currentContext: CURRENT_CONTEXT
      } as unknown as Request<never, never, Enquiry>;

      updateEnquirySpy.mockImplementationOnce(() => {
        throw new Error();
      });

      await updateEnquiryController(req, res);

      expect(insertContacts).toHaveBeenCalled();
      expect(deleteUnmatchedActivityContacts).toHaveBeenCalledTimes(1);
      expect(upsertActivityContacts).toHaveBeenCalledTimes(1);
      expect(updateEnquirySpy).toHaveBeenCalledWith(expect.objectContaining(ENQUIRY_DATA));
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateEnquiryIsDeletedFlagController', () => {
    const updateIsDeletedFlagSpy = jest.spyOn(enquiryService, 'updateEnquiryIsDeletedFlag');

    it('should return 200 if isDeleted flag is updated successfully', async () => {
      const req = {
        params: { enquiryId: 'enquiry123' },
        body: { isDeleted: true },
        currentContext: CURRENT_CONTEXT
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as unknown as Request<{ enquiryId: string }, any, { isDeleted: boolean }>;

      updateIsDeletedFlagSpy.mockResolvedValue(ENQUIRY_DATA);

      await updateEnquiryIsDeletedFlagController(req, res);

      expect(updateIsDeletedFlagSpy).toHaveBeenCalledWith('enquiry123', true, expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(ENQUIRY_DATA);
    });

    it('should return 404 if updateIsDeletedFlag returns null', async () => {
      const req = {
        params: { enquiryId: 'enquiry123' },
        body: { isDeleted: true },
        currentContext: CURRENT_CONTEXT
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as unknown as Request<{ enquiryId: string }, any, { isDeleted: boolean }>;

      updateIsDeletedFlagSpy.mockResolvedValue(null as unknown as Enquiry);

      await updateEnquiryIsDeletedFlagController(req, res);

      expect(updateIsDeletedFlagSpy).toHaveBeenCalledWith('enquiry123', true, expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Enquiry not found' });
    });

    it('calls next if the enquiry service fails for updateIsDeletedFlag', async () => {
      const req = {
        params: { enquiryId: 'enquiry123' },
        body: { isDeleted: true },
        currentContext: CURRENT_CONTEXT
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as unknown as Request<{ enquiryId: string }, any, { isDeleted: boolean }>;

      updateIsDeletedFlagSpy.mockImplementationOnce(() => {
        throw new Error();
      });

      await updateEnquiryIsDeletedFlagController(req, res);

      expect(updateIsDeletedFlagSpy).toHaveBeenCalledWith('enquiry123', true, expect.any(Object));
      expect(next).toHaveBeenCalledTimes(1);
    });
  });
});
