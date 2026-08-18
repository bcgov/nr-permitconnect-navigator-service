import {
  TEST_ACTIVITY_CONTACT_1,
  TEST_CONTACT_1,
  TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
  TEST_CURRENT_CONTEXT
} from '../data/index.ts';
import {
  createActivityContactController,
  deleteActivityContactController,
  listActivityContactController,
  updateActivityContactController
} from '../../../src/controllers/activityContact.ts';
import * as activityContactService from '../../../src/services/activityContact.ts';
import { ActivityContactRole } from '../../../src/utils/enums/projectCommon.ts';

import type { Request, Response } from 'express';
import type { Mock } from 'vitest';
import type { ActivityContact, Contact, LocalContext } from '../../../src/types/index.ts';

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

describe('createActivityContactController', () => {
  const createSpy = vi.spyOn(activityContactService, 'createActivityContactService');

  it('calls the service with authorization, context, activityId, contactId and role then responds 201', async () => {
    const req = {
      params: { activityId: TEST_ACTIVITY_CONTACT_1.activityId, contactId: TEST_CONTACT_1.contactId },
      body: { role: ActivityContactRole.PRIMARY }
    } as unknown as Request<{ activityId: string; contactId: string }, never, { role: ActivityContactRole }>;

    createSpy.mockResolvedValue(TEST_ACTIVITY_CONTACT_1);

    await createActivityContactController(req, res as unknown as Response<ActivityContact, LocalContext>);

    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(createSpy).toHaveBeenCalledWith(
      TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
      TEST_CURRENT_CONTEXT,
      TEST_ACTIVITY_CONTACT_1.activityId,
      TEST_CONTACT_1.contactId,
      ActivityContactRole.PRIMARY
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(TEST_ACTIVITY_CONTACT_1);
  });
});

describe('deleteActivityContactController', () => {
  const deleteSpy = vi.spyOn(activityContactService, 'deleteActivityContactService');

  it('calls the service with context, activityId and contactId then responds 204', async () => {
    const req = {
      params: { activityId: 'ACTI1234', contactId: TEST_CONTACT_1.contactId }
    } as unknown as Request<{ activityId: string; contactId: string }>;

    deleteSpy.mockResolvedValue(undefined);

    await deleteActivityContactController(req, res as unknown as Response<never, LocalContext>);

    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(TEST_CURRENT_CONTEXT, 'ACTI1234', TEST_CONTACT_1.contactId);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalledWith();
  });
});

describe('listActivityContactController', () => {
  const listSpy = vi.spyOn(activityContactService, 'listActivityContactsService');

  it('calls the service with activityId then responds 200', async () => {
    const req = {
      params: { activityId: 'ACTI1234' }
    } as unknown as Request<{ activityId: string }>;
    const contacts: Contact[] = [TEST_CONTACT_1];

    listSpy.mockResolvedValue(contacts as never);

    await listActivityContactController(req, res as unknown as Response);

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith('ACTI1234');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(contacts);
  });
});

describe('updateActivityContactController', () => {
  const updateSpy = vi.spyOn(activityContactService, 'updateActivityContactService');

  it('calls the service with authorization, context, activityId, contactId and role then responds 200', async () => {
    const req = {
      params: { activityId: 'ACTI1234', contactId: TEST_CONTACT_1.contactId },
      body: { role: ActivityContactRole.PRIMARY }
    } as unknown as Request<{ activityId: string; contactId: string }, never, { role: ActivityContactRole }>;

    updateSpy.mockResolvedValue(TEST_CONTACT_1 as never);

    await updateActivityContactController(req, res as unknown as Response);

    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith(
      TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
      TEST_CURRENT_CONTEXT,
      'ACTI1234',
      TEST_CONTACT_1.contactId,
      ActivityContactRole.PRIMARY
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_CONTACT_1);
  });
});
