import { enquiryService, contactService } from '../../../src/services';
import enquiryController from '../../../src/controllers/enquiry';
import { Request, Response } from 'express';
import { Enquiry, EnquiryIntake, EnquirySearchParameters } from '../../../src/types';
import { ApplicationStatus } from '../../../src/utils/enums/housing';

jest.mock('config');

const CONTACT_DATA = {
  contactId: 'contact123',
  userId: 'user123',
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '123-456-7890',
  email: 'john.doe@example.com',
  contactPreference: 'email',
  contactApplicantRelationship: 'applicant'
};

const ENQUIRY_DATA: Enquiry = {
  enquiryId: 'enquiry123',
  activityId: 'activity123',
  addedToATS: false,
  assignedUserId: null,
  atsClientId: null,
  enquiryType: 'general',
  submittedAt: '2025-02-28T00:00:00.000Z',
  submittedBy: 'testuser',
  relatedActivityId: 'activity123',
  enquiryDescription: 'Test enquiry description',
  intakeStatus: 'submitted',
  enquiryStatus: 'new',
  waitingOn: null,
  contacts: [CONTACT_DATA],
  user: null
};

const GENERATE_ENQUIRY_DATA = {
  enquiryId: 'enquiry123',
  activityId: 'activity123',
  submittedAt: '2025-02-28T00:00:00.000Z',
  submittedBy: 'testuser',
  intakeStatus: 'submitted',
  enquiryStatus: ApplicationStatus.NEW,
  enquiryType: 'general',
  relatedActivityId: 'activity123',
  enquiryDescription: 'Test enquiry description'
};

const ENQUIRY_INTAKE_DATA: EnquiryIntake = {
  contacts: [CONTACT_DATA],
  basic: {
    enquiryType: 'general',
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

const CURRENT_CONTEXT = { authType: 'BEARER', tokenPayload: null };

describe('enquiryController', () => {
  const next = jest.fn();

  describe('createEnquiry', () => {
    const upsertContactsSpy = jest.spyOn(contactService, 'upsertContacts');
    const createEnquirySpy = jest.spyOn(enquiryService, 'createEnquiry');
    const generateEnquiryDataSpy = jest.spyOn(enquiryController, 'generateEnquiryData');

    it('should return 201 if enquiry is created successfully', async () => {
      const req = {
        body: ENQUIRY_INTAKE_DATA,
        currentContext: CURRENT_CONTEXT
      } as unknown as Request<never, never, EnquiryIntake>;

      generateEnquiryDataSpy.mockResolvedValue(GENERATE_ENQUIRY_DATA);
      createEnquirySpy.mockResolvedValue(ENQUIRY_DATA);

      await enquiryController.createEnquiry(req, res, next);

      expect(generateEnquiryDataSpy).toHaveBeenCalled();
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

      generateEnquiryDataSpy.mockResolvedValue(GENERATE_ENQUIRY_DATA);
      createEnquirySpy.mockImplementationOnce(() => {
        throw new Error('failure');
      });

      await enquiryController.createEnquiry(req, res, next);

      expect(generateEnquiryDataSpy).toHaveBeenCalled();
      expect(createEnquirySpy).toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteEnquiry', () => {
    const deleteEnquirySpy = jest.spyOn(enquiryService, 'deleteEnquiry');

    it('should return 200 if enquiry is deleted successfully', async () => {
      const req = {
        params: { enquiryId: 'enquiry123' },
        currentContext: CURRENT_CONTEXT
      } as unknown as Request<{ enquiryId: string }>;

      deleteEnquirySpy.mockResolvedValue(ENQUIRY_DATA);

      await enquiryController.deleteEnquiry(req, res, next);

      expect(deleteEnquirySpy).toHaveBeenCalledWith('enquiry123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(ENQUIRY_DATA);
    });

    it('should return 404 if enquiry is not found', async () => {
      const req = {
        params: { enquiryId: 'enquiry123' },
        currentContext: CURRENT_CONTEXT
      } as unknown as Request<{ enquiryId: string }>;

      deleteEnquirySpy.mockResolvedValue(null as unknown as Enquiry);

      await enquiryController.deleteEnquiry(req, res, next);

      expect(deleteEnquirySpy).toHaveBeenCalledWith('enquiry123');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Enquiry not found' });
    });

    it('calls next if the enquiry service fails to delete enquiry', async () => {
      const req = {
        params: { enquiryId: 'enquiry123' },
        currentContext: CURRENT_CONTEXT
      } as unknown as Request<{ enquiryId: string }>;

      deleteEnquirySpy.mockImplementationOnce(() => {
        throw new Error();
      });

      await enquiryController.deleteEnquiry(req, res, next);

      expect(deleteEnquirySpy).toHaveBeenCalledWith('enquiry123');
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('getEnquiries', () => {
    const getEnquiriesSpy = jest.spyOn(enquiryService, 'getEnquiries');

    it('should return 200 with enquiries', async () => {
      const req = {
        currentContext: CURRENT_CONTEXT,
        currentAuthorization: { attributes: [] }
      } as unknown as Request;

      const enquiries: Enquiry[] = [ENQUIRY_DATA];
      getEnquiriesSpy.mockResolvedValue(enquiries);

      await enquiryController.getEnquiries(req, res, next);

      expect(getEnquiriesSpy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(enquiries);
    });

    it('calls next if the enquiry service fails', async () => {
      const req = { currentContext: CURRENT_CONTEXT } as unknown as Request;
      getEnquiriesSpy.mockImplementationOnce(() => {
        throw new Error();
      });

      await enquiryController.getEnquiries(req, res, next);

      expect(getEnquiriesSpy).toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('getEnquiry', () => {
    const getEnquirySpy = jest.spyOn(enquiryService, 'getEnquiry');

    it('should return 200 if enquiry is found', async () => {
      const req = {
        params: { enquiryId: 'enquiry123' },
        currentContext: CURRENT_CONTEXT
      } as unknown as Request<{ enquiryId: string }>;

      getEnquirySpy.mockResolvedValue(ENQUIRY_DATA);

      await enquiryController.getEnquiry(req, res, next);

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

      await enquiryController.getEnquiry(req, res, next);

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

      await enquiryController.getEnquiry(req, res, next);

      expect(getEnquirySpy).toHaveBeenCalledWith('enquiry123');
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('listRelatedEnquiries', () => {
    const getRelatedEnquiriesSpy = jest.spyOn(enquiryService, 'getRelatedEnquiries');

    it('should return 200 with related enquiries', async () => {
      const req = {
        params: { activityId: 'activity123' }
      } as unknown as Request<{ activityId: string }>;

      const relatedEnquiries: Enquiry[] = [ENQUIRY_DATA];
      getRelatedEnquiriesSpy.mockResolvedValue(relatedEnquiries);

      await enquiryController.listRelatedEnquiries(req, res, next);

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

      await enquiryController.listRelatedEnquiries(req, res, next);

      expect(getRelatedEnquiriesSpy).toHaveBeenCalledWith('activity123');
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('searchEnquiries', () => {
    const searchEnquiriesSpy = jest.spyOn(enquiryService, 'searchEnquiries');

    it('should return 200 if search is successful', async () => {
      const req = {
        query: { enquiryId: ['enquiry123'], includeUser: true },
        currentContext: CURRENT_CONTEXT,
        currentAuthorization: { attributes: [] }
      } as unknown as Request<never, never, never, EnquirySearchParameters>;

      const enquiries: Enquiry[] = [ENQUIRY_DATA];
      searchEnquiriesSpy.mockResolvedValue(enquiries);

      await enquiryController.searchEnquiries(req, res, next);

      expect(searchEnquiriesSpy).toHaveBeenCalledWith({
        enquiryId: ['enquiry123'],
        includeUser: true
      });
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

      await enquiryController.searchEnquiries(req, res, next);

      expect(searchEnquiriesSpy).toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateEnquiry', () => {
    const upsertContactsSpy = jest.spyOn(contactService, 'upsertContacts');
    const updateEnquirySpy = jest.spyOn(enquiryService, 'updateEnquiry');

    it('should return 200 if enquiry is updated successfully', async () => {
      const req = {
        body: { ...ENQUIRY_DATA },
        currentContext: CURRENT_CONTEXT
      } as unknown as Request<never, never, Enquiry>;

      updateEnquirySpy.mockResolvedValue(ENQUIRY_DATA);

      await enquiryController.updateEnquiry(req, res, next);

      expect(upsertContactsSpy).toHaveBeenCalledWith(ENQUIRY_DATA.contacts, CURRENT_CONTEXT, ENQUIRY_DATA.activityId);
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

      await enquiryController.updateEnquiry(req, res, next);

      expect(upsertContactsSpy).toHaveBeenCalledWith(ENQUIRY_DATA.contacts, CURRENT_CONTEXT, ENQUIRY_DATA.activityId);
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

      await enquiryController.updateEnquiry(req, res, next);

      expect(upsertContactsSpy).toHaveBeenCalledWith(ENQUIRY_DATA.contacts, CURRENT_CONTEXT, ENQUIRY_DATA.activityId);
      expect(updateEnquirySpy).toHaveBeenCalledWith(expect.objectContaining(ENQUIRY_DATA));
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateIsDeletedFlag', () => {
    const updateIsDeletedFlagSpy = jest.spyOn(enquiryService, 'updateIsDeletedFlag');

    it('should return 200 if isDeleted flag is updated successfully', async () => {
      const req = {
        params: { enquiryId: 'enquiry123' },
        body: { isDeleted: true },
        currentContext: CURRENT_CONTEXT
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as unknown as Request<{ enquiryId: string }, any, { isDeleted: boolean }>;

      updateIsDeletedFlagSpy.mockResolvedValue(ENQUIRY_DATA);

      await enquiryController.updateIsDeletedFlag(req, res, next);

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

      await enquiryController.updateIsDeletedFlag(req, res, next);

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

      await enquiryController.updateIsDeletedFlag(req, res, next);

      expect(updateIsDeletedFlagSpy).toHaveBeenCalledWith('enquiry123', true, expect.any(Object));
      expect(next).toHaveBeenCalledTimes(1);
    });
  });
});
