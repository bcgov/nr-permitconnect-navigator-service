import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import * as contactService from '../../../src/services/contact';
import { Request, Response } from 'express';
import {
  deleteContactController,
  getContactController,
  searchContactsController,
  updateContactController
} from '../../../src/controllers/contact';

// Mock config library - @see {@link https://stackoverflow.com/a/64819698}
jest.mock('config');

const CONTACT_DATA = {
  contactId: 'contact123',
  userId: 'user123',
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '123-456-7890',
  email: 'john.doe@example.com',
  contactPreference: 'email',
  contactApplicantRelationship: 'applicant',
  createdAt: null,
  createdBy: null,
  updatedBy: null,
  updatedAt: null
};

const ACTIVITY_CONTACT_DATA = {
  activityId: 'ACTI1234',
  contactId: 'contact123'
};

const CONTACT_DATA_WITH_ACTIVITY = {
  ...CONTACT_DATA,
  contactActivity: [ACTIVITY_CONTACT_DATA]
};

const mockResponse = () => {
  const res: { status?: jest.Mock; json?: jest.Mock; end?: jest.Mock } = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);

  return res;
};

let res = mockResponse();
beforeEach(() => {
  res = mockResponse();
});

afterEach(() => {
  jest.resetAllMocks();
});

const CURRENT_CONTEXT = { authType: 'BEARER', tokenPayload: null };

describe('contactController', () => {
  const next = jest.fn();

  describe('deleteContactController', () => {
    const deleteContactSpy = jest.spyOn(contactService, 'deleteContact');

    it('should return 204 if the contact is deleted successfully', async () => {
      const req = {
        params: { contactId: 'contact123' },
        currentContext: CURRENT_CONTEXT
      } as unknown as Request;

      deleteContactSpy.mockResolvedValue();
      res.end = jest.fn().mockReturnValue(res);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await deleteContactController(req as any, res as unknown as Response);

      expect(deleteContactSpy).toHaveBeenCalledTimes(1);
      expect(deleteContactSpy).toHaveBeenCalledWith(req.params.contactId);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.end).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledTimes(0);
    });

    it('should return 404 if the contact is not found', async () => {
      const req = {
        params: { contactId: 'contact123' },
        currentContext: CURRENT_CONTEXT
      } as unknown as Request;

      const notFoundError = new PrismaClientKnownRequestError('Contact not found', {
        code: 'P2025',
        clientVersion: '2.19.0'
      });

      deleteContactSpy.mockRejectedValueOnce(notFoundError);
      res.end = jest.fn().mockReturnValue(res);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await deleteContactController(req as any, res as unknown as Response);

      expect(deleteContactSpy).toHaveBeenCalledTimes(1);
      expect(deleteContactSpy).toHaveBeenCalledWith(req.params.contactId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Contact not found' });
      expect(res.end).toHaveBeenCalledTimes(0);
    });

    it('calls next if the contact service fails', async () => {
      const req = {
        params: { contactId: 'contact123' },
        currentContext: CURRENT_CONTEXT
      } as unknown as Request;

      deleteContactSpy.mockImplementationOnce(() => {
        throw new Error('Service failure');
      });
      res.end = jest.fn().mockReturnValue(res);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await deleteContactController(req as any, res as unknown as Response);

      expect(deleteContactSpy).toHaveBeenCalledTimes(1);
      expect(deleteContactSpy).toHaveBeenCalledWith(req.params.contactId);
      expect(res.status).toHaveBeenCalledTimes(0); // response never sent
      expect(next).toHaveBeenCalledTimes(1); // error bubbled up
    });
  });

  describe('getContactController', () => {
    const getContactSpy = jest.spyOn(contactService, 'getContact');

    it('should return 200 and the contact if found', async () => {
      const req = {
        params: { contactId: 'contact123' },
        query: { includeActivities: false },
        currentContext: CURRENT_CONTEXT
      } as unknown as Request;

      getContactSpy.mockResolvedValue(CONTACT_DATA);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await getContactController(req as any, res as unknown as Response);

      expect(getContactSpy).toHaveBeenCalledTimes(1);
      expect(getContactSpy).toHaveBeenCalledWith(req.params.contactId, false);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(CONTACT_DATA);
    });

    it('should return 200 and the contact with activity contact if found', async () => {
      const req = {
        params: { contactId: 'contact123' },
        query: { includeActivities: true },
        currentContext: CURRENT_CONTEXT
      } as unknown as Request;

      getContactSpy.mockResolvedValue(CONTACT_DATA_WITH_ACTIVITY);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await getContactController(req as any, res as unknown as Response);

      expect(getContactSpy).toHaveBeenCalledTimes(1);
      expect(getContactSpy).toHaveBeenCalledWith(req.params.contactId, true);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(CONTACT_DATA_WITH_ACTIVITY);
    });

    it('should return 404 if the contact is not found', async () => {
      const req = {
        params: { contactId: 'contact123' },
        query: { includeActivities: false },
        currentContext: CURRENT_CONTEXT
      } as unknown as Request;

      getContactSpy.mockImplementationOnce(() => {
        throw new Error();
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await getContactController(req as any, res as unknown as Response);

      expect(getContactSpy).toHaveBeenCalledTimes(1);
      expect(getContactSpy).toHaveBeenCalledWith(req.params.contactId, false);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Contact not found' });
    });

    it('calls next if the contact service fails', async () => {
      const req = {
        params: { contactId: 'contact123' },
        query: { includeActivities: false },
        currentContext: CURRENT_CONTEXT
      } as unknown as Request;

      getContactSpy.mockImplementationOnce(() => {
        throw new Error('Service failure');
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await getContactController(req as any, res as unknown as Response);

      expect(getContactSpy).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('searchContactsController', () => {
    const searchContactsSpy = jest.spyOn(contactService, 'searchContacts');

    it('should return 200 if all good', async () => {
      const req = {
        query: { userId: '5e3f0c19-8664-4a43-ac9e-210da336e923' },
        currentContext: CURRENT_CONTEXT
      } as unknown as Request;

      const contacts = [CONTACT_DATA];

      searchContactsSpy.mockResolvedValue(contacts);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await searchContactsController(req as any, res as unknown as Response);

      expect(searchContactsSpy).toHaveBeenCalledTimes(1);
      expect(searchContactsSpy).toHaveBeenCalledWith({
        userId: ['5e3f0c19-8664-4a43-ac9e-210da336e923'],
        contactId: undefined,
        email: undefined,
        firstName: undefined,
        lastName: undefined,
        contactApplicantRelationship: undefined,
        phoneNumber: undefined
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(contacts);
    });

    it('adds dashes to user IDs', async () => {
      const req = {
        query: { userId: '5e3f0c1986644a43ac9e210da336e923,8b9dedd279d442c6b82f52844a8e2757' },
        currentContext: CURRENT_CONTEXT
      } as unknown as Request;

      const contacts = [CONTACT_DATA];

      searchContactsSpy.mockResolvedValue(contacts);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await searchContactsController(req as any, res as unknown as Response);

      expect(searchContactsSpy).toHaveBeenCalledTimes(1);
      expect(searchContactsSpy).toHaveBeenCalledWith({
        userId: ['5e3f0c19-8664-4a43-ac9e-210da336e923', '8b9dedd2-79d4-42c6-b82f-52844a8e2757'],
        contactId: undefined,
        email: undefined,
        firstName: undefined,
        lastName: undefined,
        contactApplicantRelationship: undefined,
        phoneNumber: undefined
      });
    });

    it('adds dashes to contact IDs', async () => {
      const req = {
        query: { contactId: '5e3f0c1986644a43ac9e210da336e923,8b9dedd279d442c6b82f52844a8e2757' },
        currentContext: CURRENT_CONTEXT
      } as unknown as Request;

      const contacts = [CONTACT_DATA];

      searchContactsSpy.mockResolvedValue(contacts);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await searchContactsController(req as any, res as unknown as Response);

      expect(searchContactsSpy).toHaveBeenCalledTimes(1);
      expect(searchContactsSpy).toHaveBeenCalledWith({
        contactId: ['5e3f0c19-8664-4a43-ac9e-210da336e923', '8b9dedd2-79d4-42c6-b82f-52844a8e2757'],
        userId: undefined,
        email: undefined,
        firstName: undefined,
        lastName: undefined,
        contactApplicantRelationship: undefined,
        phoneNumber: undefined
      });
    });

    it('calls next if the contact service fails to list contacts', async () => {
      const req = {
        query: { userId: '5e3f0c19-8664-4a43-ac9e-210da336e923' },
        currentContext: CURRENT_CONTEXT
      } as unknown as Request;

      searchContactsSpy.mockImplementationOnce(() => {
        throw new Error();
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await searchContactsController(req as any, res as unknown as Response);

      expect(searchContactsSpy).toHaveBeenCalledTimes(1);
      expect(searchContactsSpy).toHaveBeenCalledWith({
        userId: ['5e3f0c19-8664-4a43-ac9e-210da336e923'],
        contactId: undefined,
        email: undefined,
        firstName: undefined,
        lastName: undefined,
        contactApplicantRelationship: undefined,
        phoneNumber: undefined
      });
      expect(res.status).toHaveBeenCalledTimes(0);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateContactController', () => {
    const upsertContactsSpy = jest.spyOn(contactService, 'upsertContacts');

    it('should return 200 if contact is updated successfully', async () => {
      const req = {
        body: {
          userId: '5e3f0c19-8664-4a43-ac9e-210da336e923',
          email: 'first.last@gov.bc.ca',
          firstName: 'First',
          lastName: 'Last'
        },
        currentContext: CURRENT_CONTEXT
      } as unknown as Request;

      upsertContactsSpy.mockResolvedValueOnce([CONTACT_DATA]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await updateContactController(req as any, res as unknown as Response);

      expect(upsertContactsSpy).toHaveBeenCalledTimes(1);
      expect(upsertContactsSpy).toHaveBeenCalledWith([req.body], req.currentContext);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('calls next if the contact service fails to update contact', async () => {
      const req = {
        body: {
          userId: '5e3f0c19-8664-4a43-ac9e-210da336e923',
          email: 'first.last@gov.bc.ca',
          firstName: 'First',
          lastName: 'Last'
        },
        currentContext: CURRENT_CONTEXT
      } as unknown as Request;

      upsertContactsSpy.mockImplementationOnce(() => {
        throw new Error();
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await updateContactController(req as any, res as unknown as Response);

      expect(upsertContactsSpy).toHaveBeenCalledTimes(1);
      expect(upsertContactsSpy).toHaveBeenCalledWith([req.body], req.currentContext);
      expect(res.status).toHaveBeenCalledTimes(0);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });
});
