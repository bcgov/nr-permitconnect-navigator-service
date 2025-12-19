import { TEST_CURRENT_CONTEXT, TEST_CONTACT_1, TEST_CONTACT_WITH_ACTIVITY_1 } from '../data/index.ts';
import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import {
  deleteContactController,
  getContactController,
  searchContactsController,
  upsertContactController
} from '../../../src/controllers/contact.ts';
import * as contactService from '../../../src/services/contact.ts';
import { uuidv4Pattern } from '../../../src/utils/regexp.ts';

import type { Request, Response } from 'express';
import type { Contact, ContactSearchParameters } from '../../../src/types/index.ts';

// Mock config library - @see {@link https://stackoverflow.com/a/64819698}
jest.mock('config');

const mockResponse = () => {
  const res: { status?: jest.Mock; json?: jest.Mock; end?: jest.Mock } = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};

let res = mockResponse();
beforeEach(() => {
  res = mockResponse();
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('deleteContactController', () => {
  const deleteContactSpy = jest.spyOn(contactService, 'deleteContact');

  it('should call services and respond with 204', async () => {
    const req = {
      params: { contactId: '59b6bad3-ed3c-43f6-81f9-bbd1609d880f' },
      currentContext: TEST_CURRENT_CONTEXT
    } as unknown as Request;

    deleteContactSpy.mockResolvedValue();

    await deleteContactController(req as unknown as Request<{ contactId: string }>, res as unknown as Response);

    expect(deleteContactSpy).toHaveBeenCalledTimes(1);
    expect(deleteContactSpy).toHaveBeenCalledWith(prismaTxMock, req.params.contactId);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalledTimes(1);
  });
});

describe('getContactController', () => {
  const getContactSpy = jest.spyOn(contactService, 'getContact');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      params: { contactId: '59b6bad3-ed3c-43f6-81f9-bbd1609d880f' },
      query: { includeActivities: false },
      currentContext: TEST_CURRENT_CONTEXT
    } as unknown as Request;

    getContactSpy.mockResolvedValue(TEST_CONTACT_1);

    await getContactController(
      req as unknown as Request<{ contactId: string }, never, never, { includeActivities?: boolean }>,
      res as unknown as Response
    );

    expect(getContactSpy).toHaveBeenCalledTimes(1);
    expect(getContactSpy).toHaveBeenCalledWith(prismaTxMock, req.params.contactId, false);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_CONTACT_1);
  });

  it('should call services and respond with 200 and result with activity contact if found', async () => {
    const req = {
      params: { contactId: '59b6bad3-ed3c-43f6-81f9-bbd1609d880f' },
      query: { includeActivities: true },
      currentContext: TEST_CURRENT_CONTEXT
    } as unknown as Request;

    getContactSpy.mockResolvedValue(TEST_CONTACT_WITH_ACTIVITY_1);

    await getContactController(
      req as unknown as Request<{ contactId: string }, never, never, { includeActivities?: boolean }>,
      res as unknown as Response
    );

    expect(getContactSpy).toHaveBeenCalledTimes(1);
    expect(getContactSpy).toHaveBeenCalledWith(prismaTxMock, req.params.contactId, true);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_CONTACT_WITH_ACTIVITY_1);
  });
});

describe('searchContactsController', () => {
  const searchContactsSpy = jest.spyOn(contactService, 'searchContacts');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      query: { userId: '5e3f0c19-8664-4a43-ac9e-210da336e923' },
      currentContext: TEST_CURRENT_CONTEXT
    } as unknown as Request;

    const contacts = [TEST_CONTACT_1];

    searchContactsSpy.mockResolvedValue(contacts);

    await searchContactsController(
      req as unknown as Request<never, never, never, ContactSearchParameters>,
      res as unknown as Response
    );

    expect(searchContactsSpy).toHaveBeenCalledTimes(1);
    expect(searchContactsSpy).toHaveBeenCalledWith(prismaTxMock, {
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
      currentContext: TEST_CURRENT_CONTEXT
    } as unknown as Request;

    const contacts = [TEST_CONTACT_1];

    searchContactsSpy.mockResolvedValue(contacts);

    await searchContactsController(
      req as unknown as Request<never, never, never, ContactSearchParameters>,
      res as unknown as Response
    );

    expect(searchContactsSpy).toHaveBeenCalledTimes(1);
    expect(searchContactsSpy).toHaveBeenCalledWith(prismaTxMock, {
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
      currentContext: TEST_CURRENT_CONTEXT
    } as unknown as Request;

    const contacts = [TEST_CONTACT_1];

    searchContactsSpy.mockResolvedValue(contacts);

    await searchContactsController(
      req as unknown as Request<never, never, never, ContactSearchParameters>,
      res as unknown as Response
    );

    expect(searchContactsSpy).toHaveBeenCalledTimes(1);
    expect(searchContactsSpy).toHaveBeenCalledWith(prismaTxMock, {
      contactId: ['5e3f0c19-8664-4a43-ac9e-210da336e923', '8b9dedd2-79d4-42c6-b82f-52844a8e2757'],
      userId: undefined,
      email: undefined,
      firstName: undefined,
      lastName: undefined,
      contactApplicantRelationship: undefined,
      phoneNumber: undefined
    });
  });
});

describe('updateContactController', () => {
  const upsertContactsSpy = jest.spyOn(contactService, 'upsertContacts');

  describe('no contactId in body', () => {
    it('should call services and respond with 200 and result', async () => {
      const req = {
        body: {
          userId: '5e3f0c19-8664-4a43-ac9e-210da336e923',
          email: 'first.last@gov.bc.ca',
          firstName: 'First',
          lastName: 'Last'
        },
        currentContext: TEST_CURRENT_CONTEXT
      } as unknown as Request;

      upsertContactsSpy.mockResolvedValueOnce([TEST_CONTACT_1]);

      await upsertContactController(
        req as unknown as Request<never, never, Contact, never>,
        res as unknown as Response
      );

      expect(upsertContactsSpy).toHaveBeenCalledTimes(1);
      expect(upsertContactsSpy).toHaveBeenCalledWith(prismaTxMock, [
        {
          ...req.body,
          contactId: expect.stringMatching(uuidv4Pattern),
          updatedAt: expect.any(Date),
          updatedBy: TEST_CURRENT_CONTEXT.userId
        }
      ]);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('contactId in body', () => {
    it('should call services and respond with 200 and result', async () => {
      const req = {
        body: {
          contactId: '59b6bad3-ed3c-43f6-81f9-bbd1609d880f',
          userId: '5e3f0c19-8664-4a43-ac9e-210da336e923',
          email: 'first.last@gov.bc.ca',
          firstName: 'First',
          lastName: 'Last'
        },
        currentContext: TEST_CURRENT_CONTEXT
      } as unknown as Request;

      upsertContactsSpy.mockResolvedValueOnce([TEST_CONTACT_1]);

      await upsertContactController(
        req as unknown as Request<never, never, Contact, never>,
        res as unknown as Response
      );

      expect(upsertContactsSpy).toHaveBeenCalledTimes(1);
      expect(upsertContactsSpy).toHaveBeenCalledWith(prismaTxMock, [
        {
          ...req.body,
          contactId: '59b6bad3-ed3c-43f6-81f9-bbd1609d880f',
          updatedAt: expect.any(Date),
          updatedBy: TEST_CURRENT_CONTEXT.userId
        }
      ]);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
