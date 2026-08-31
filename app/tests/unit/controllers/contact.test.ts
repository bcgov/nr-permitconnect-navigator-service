import { TEST_CONTACT_1, TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR, TEST_CURRENT_CONTEXT } from '#tests/unit/data/index';
import {
  deleteContactController,
  getContactController,
  getCurrentUserContactController,
  matchContactsController,
  searchContactsController,
  upsertContactController
} from '#src/controllers/contact';
import * as contactService from '#src/services/contact';

import type { Request, Response } from 'express';
import type { Mock } from 'vitest';
import type {
  Contact,
  ContactSearchParameters,
  GetContactRequest,
  LocalContext,
  SearchContactsRequest,
  UpsertContactRequest
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

describe('deleteContactController', () => {
  const deleteSpy = vi.spyOn(contactService, 'deleteContactService');

  it('calls the service with contactId then responds 204', async () => {
    const req = {
      params: { contactId: TEST_CONTACT_1.contactId }
    } as unknown as Request<{ contactId: string }>;

    deleteSpy.mockResolvedValue(undefined);

    await deleteContactController(req, res as unknown as Response<never, LocalContext>);

    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(TEST_CONTACT_1.contactId);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalledWith();
  });
});

describe('getContactController', () => {
  const getSpy = vi.spyOn(contactService, 'getContactService');

  it('calls the service with contactId and includeActivities then responds 200', async () => {
    const req = {
      params: { contactId: TEST_CONTACT_1.contactId },
      query: { includeActivities: true }
    } as unknown as Request<{ contactId: string }, never, never, GetContactRequest>;

    getSpy.mockResolvedValue(TEST_CONTACT_1);

    await getContactController(req, res as unknown as Response<Contact>);

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith(TEST_CONTACT_1.contactId, true);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_CONTACT_1);
  });

  it('defaults includeActivities to false when query is undefined', async () => {
    const req = {
      params: { contactId: TEST_CONTACT_1.contactId },
      query: {}
    } as unknown as Request<{ contactId: string }, never, never, GetContactRequest>;

    getSpy.mockResolvedValue(TEST_CONTACT_1);

    await getContactController(req, res as unknown as Response<Contact>);

    expect(getSpy).toHaveBeenCalledWith(TEST_CONTACT_1.contactId, false);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('getCurrentUserContactController', () => {
  const searchSpy = vi.spyOn(contactService, 'searchContactsService');

  it('calls the service with userId from context then responds 200', async () => {
    const req = {} as unknown as Request;

    searchSpy.mockResolvedValue([TEST_CONTACT_1]);

    await getCurrentUserContactController(req, res as unknown as Response<Contact, LocalContext>);

    expect(searchSpy).toHaveBeenCalledTimes(1);
    expect(searchSpy).toHaveBeenCalledWith({
      userId: [TEST_CURRENT_CONTEXT.userId]
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_CONTACT_1);
  });
});

describe('matchContactsController', () => {
  const matchSpy = vi.spyOn(contactService, 'matchContactsService');
  const matchExactSpy = vi.spyOn(contactService, 'matchContactsExactService');

  it('calls matchContactsService when user has AZUREIDIR identity', async () => {
    const req = {
      body: { email: 'john@example.com' }
    } as unknown as Request<never, never, ContactSearchParameters, never>;

    res.locals.currentContext = {
      ...TEST_CURRENT_CONTEXT,
      tokenPayload: { identity_provider: 'azureidir' }
    };

    matchSpy.mockResolvedValue([TEST_CONTACT_1]);

    await matchContactsController(req, res as unknown as Response<Contact[], LocalContext>);

    expect(matchSpy).toHaveBeenCalledTimes(1);
    expect(matchSpy).toHaveBeenCalledWith({ email: 'john@example.com' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([TEST_CONTACT_1]);
  });

  it('calls matchContactsExactService when user does not have AZUREIDIR identity', async () => {
    const req = {
      body: { email: 'john@example.com' }
    } as unknown as Request<never, never, ContactSearchParameters, never>;

    res.locals.currentContext = {
      ...TEST_CURRENT_CONTEXT,
      tokenPayload: { identity_provider: 'bceid' }
    };

    matchExactSpy.mockResolvedValue([TEST_CONTACT_1]);

    await matchContactsController(req, res as unknown as Response<Contact[], LocalContext>);

    expect(matchExactSpy).toHaveBeenCalledTimes(1);
    expect(matchExactSpy).toHaveBeenCalledWith({ email: 'john@example.com' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([TEST_CONTACT_1]);
  });
});

describe('searchContactsController', () => {
  const searchSpy = vi.spyOn(contactService, 'searchContactsService');

  it('calls the service with parsed and coerced parameters then responds 200', async () => {
    const req = {
      body: {
        userId: 'aaaabbbb-cccc-dddd-eeee-ffff00001111',
        email: 'john@example.com',
        includeActivities: true
      }
    } as unknown as Request<never, never, SearchContactsRequest, never>;

    searchSpy.mockResolvedValue([TEST_CONTACT_1]);

    await searchContactsController(req, res as unknown as Response<Contact[]>);

    expect(searchSpy).toHaveBeenCalledTimes(1);
    expect(searchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'john@example.com',
        includeActivities: true
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([TEST_CONTACT_1]);
  });

  it('handles an empty (defaulted) body', async () => {
    const req = {
      body: { includeActivities: false, hasActivity: false }
    } as unknown as Request<never, never, SearchContactsRequest, never>;

    searchSpy.mockResolvedValue([]);

    await searchContactsController(req, res as unknown as Response<Contact[]>);

    expect(searchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        includeActivities: false
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('upsertContactController', () => {
  const upsertSpy = vi.spyOn(contactService, 'upsertContactsService');

  it('generates contactId when not provided and calls the service then responds 200', async () => {
    const contactWithoutId = { ...TEST_CONTACT_1, contactId: undefined };
    const req = {
      body: contactWithoutId
    } as unknown as Request<never, never, UpsertContactRequest, never>;

    upsertSpy.mockResolvedValue([TEST_CONTACT_1]);

    await upsertContactController(req, res as unknown as Response<Contact, LocalContext>);

    expect(upsertSpy).toHaveBeenCalledTimes(1);
    expect(upsertSpy).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          contactId: expect.any(String)
        })
      ])
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_CONTACT_1);
  });

  it('preserves existing contactId', async () => {
    const req = {
      body: TEST_CONTACT_1
    } as unknown as Request<never, never, UpsertContactRequest, never>;

    upsertSpy.mockResolvedValue([TEST_CONTACT_1]);

    await upsertContactController(req, res as unknown as Response<Contact, LocalContext>);

    expect(upsertSpy).toHaveBeenCalledWith([
      expect.objectContaining({
        contactId: TEST_CONTACT_1.contactId
      })
    ]);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
