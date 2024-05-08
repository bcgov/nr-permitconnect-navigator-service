import { NIL } from 'uuid';

import { permitController } from '../../../src/controllers';
import { permitService, userService } from '../../../src/services';
import * as utils from '../../../src/components/utils';

// Mock config library - @see {@link https://stackoverflow.com/a/64819698}
jest.mock('config');

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

const CURRENT_USER = { authType: 'BEARER', tokenPayload: null };

describe('createPermit', () => {
  const next = jest.fn();

  // Mock service calls
  const createSpy = jest.spyOn(permitService, 'createPermit');
  const getCurrentIdentitySpy = jest.spyOn(utils, 'getCurrentIdentity');
  const getCurrentUserIdSpy = jest.spyOn(userService, 'getCurrentUserId');

  it('should return 201 if all good', async () => {
    const now = new Date();
    const req = {
      body: {
        permitType: 'ABC',
        permitTypeId: '123',
        activityId: 'ACT_ID',
        issuedPermitId: '1',
        trackingId: '2',
        authStatus: 'ACTIVE',
        needed: 'true',
        status: 'FOO',
        submittedDate: now,
        adjudicationDate: now
      },
      currentUser: CURRENT_USER
    };

    const USR_IDENTITY = 'xxxy';
    const USR_ID = 'abc-123';

    const created = {
      permitId: '12345',
      permitTypeId: 123,
      activityId: 'ACT_ID',
      issuedPermitId: '1',
      trackingId: '2',
      authStatus: 'ACTIVE',
      needed: 'true',
      status: 'FOO',
      submittedDate: now.toISOString(),
      adjudicationDate: now.toISOString(),
      statusLastVerified: now.toISOString()
    };

    createSpy.mockResolvedValue(created);
    getCurrentIdentitySpy.mockReturnValue(USR_IDENTITY);
    getCurrentUserIdSpy.mockResolvedValue(USR_ID);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await permitController.createPermit(req as any, res as any, next);

    expect(getCurrentIdentitySpy).toHaveBeenCalledTimes(1);
    expect(getCurrentIdentitySpy).toHaveBeenCalledWith(CURRENT_USER, NIL);
    expect(getCurrentUserIdSpy).toHaveBeenCalledTimes(1);
    expect(getCurrentUserIdSpy).toHaveBeenCalledWith(USR_IDENTITY, NIL);
    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(createSpy).toHaveBeenCalledWith({ ...req.body, updatedBy: USR_ID });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(created);
  });

  it('calls next if the permit service fails to create', async () => {
    const now = new Date();
    const req = {
      body: {
        permitType: 'ABC',
        permitTypeId: '123',
        activityId: 'ACT_ID',
        issuedPermitId: '1',
        trackingId: '2',
        authStatus: 'ACTIVE',
        needed: 'true',
        status: 'FOO',
        submittedDate: now,
        adjudicationDate: now
      },
      currentUser: CURRENT_USER
    };

    const USR_ID = 'abc-123';

    getCurrentUserIdSpy.mockResolvedValue(USR_ID);

    createSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await permitController.createPermit(req as any, res as any, next);

    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(createSpy).toHaveBeenCalledWith({ ...req.body, updatedBy: USR_ID });
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe('deletePermit', () => {
  const next = jest.fn();

  // Mock service calls
  const deleteSpy = jest.spyOn(permitService, 'deletePermit');

  it('should return 200 if all good', async () => {
    const req = {
      params: { permitId: 'abc123' },
      currentUser: CURRENT_USER
    };

    const now = new Date();
    const deleted = {
      permitId: '12345',
      permitTypeId: 123,
      activityId: 'ACT_ID',
      issuedPermitId: '1',
      trackingId: '2',
      authStatus: 'ACTIVE',
      needed: 'true',
      status: 'FOO',
      submittedDate: now.toISOString(),
      adjudicationDate: now.toISOString(),
      statusLastVerified: now.toISOString()
    };

    deleteSpy.mockResolvedValue(deleted);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await permitController.deletePermit(req as any, res as any, next);

    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(req.params.permitId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(deleted);
  });

  it('calls next if the permit service fails to delete', async () => {
    const req = {
      params: { permitId: 'abc123' },
      currentUser: CURRENT_USER
    };

    deleteSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await permitController.deletePermit(req as any, res as any, next);

    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(req.params.permitId);
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe('getPermitTypes', () => {
  const next = jest.fn();

  // Mock service calls
  const permitTypesSpy = jest.spyOn(permitService, 'getPermitTypes');

  it('should return 200 if all good', async () => {
    const req = {
      currentUser: CURRENT_USER
    };

    const permitTypesList = [
      {
        permitTypeId: 123,
        agency: 'SOME_AGENCY',
        division: 'SOME_DIVISION',
        branch: 'SOME_BRANCH',
        businessDomain: 'DOMAIN',
        type: 'ABC',
        family: null,
        name: 'PERMIT1',
        nameSubtype: null,
        acronym: 'PRT1',
        trackedInATS: true,
        sourceSystem: null,
        sourceSystemAcronym: 'SRC'
      }
    ];

    permitTypesSpy.mockResolvedValue(permitTypesList);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await permitController.getPermitTypes(req as any, res as any, next);

    expect(permitTypesSpy).toHaveBeenCalledTimes(1);
    expect(permitTypesSpy).toHaveBeenCalledWith();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(permitTypesList);
  });

  it('calls next if the permit service fails to get permit types', async () => {
    const req = {
      currentUser: CURRENT_USER
    };

    permitTypesSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await permitController.getPermitTypes(req as any, res as any, next);

    expect(permitTypesSpy).toHaveBeenCalledTimes(1);
    expect(permitTypesSpy).toHaveBeenCalledWith();
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe('listPermits', () => {
  const next = jest.fn();

  // Mock service calls
  const listSpy = jest.spyOn(permitService, 'listPermits');

  it('should return 200 if all good', async () => {
    const now = new Date();
    const req = {
      params: { activityId: 'ACT_ID' },
      currentUser: CURRENT_USER
    };

    const permitList = [
      {
        permitId: '12345',
        permitTypeId: 123,
        activityId: 'ACT_ID',
        issuedPermitId: '1',
        trackingId: '2',
        authStatus: 'ACTIVE',
        needed: 'true',
        status: 'FOO',
        submittedDate: now.toISOString(),
        adjudicationDate: now.toISOString(),
        statusLastVerified: now.toISOString()
      }
    ];

    listSpy.mockResolvedValue(permitList);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await permitController.listPermits(req as any, res as any, next);

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith(req.params.activityId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(permitList);
  });

  it('calls next if the permit service fails to list permits', async () => {
    const req = {
      params: { activityId: 'ACT_ID' },
      currentUser: CURRENT_USER
    };

    listSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await permitController.listPermits(req as any, res as any, next);

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith(req.params.activityId);
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe('updatePermit', () => {
  const next = jest.fn();

  // Mock service calls
  const updateSpy = jest.spyOn(permitService, 'updatePermit');
  const getCurrentIdentitySpy = jest.spyOn(utils, 'getCurrentIdentity');
  const getCurrentUserIdSpy = jest.spyOn(userService, 'getCurrentUserId');

  it('should return 200 if all good', async () => {
    const now = new Date();
    const req = {
      body: {
        permitType: 'ABC',
        permitTypeId: '123',
        activityId: 'ACT_ID',
        issuedPermitId: '1',
        trackingId: '2',
        authStatus: 'ACTIVE',
        needed: 'true',
        status: 'FOO',
        submittedDate: now,
        adjudicationDate: now
      },
      currentUser: CURRENT_USER
    };

    const USR_IDENTITY = 'xxxy';
    const USR_ID = 'abc-123';

    const updated = {
      permitId: '12345',
      permitTypeId: 123,
      activityId: 'ACT_ID',
      issuedPermitId: '1',
      trackingId: '2',
      authStatus: 'ACTIVE',
      needed: 'true',
      status: 'FOO',
      submittedDate: now.toISOString(),
      adjudicationDate: now.toISOString(),
      statusLastVerified: now.toISOString()
    };

    updateSpy.mockResolvedValue(updated);
    getCurrentIdentitySpy.mockReturnValue(USR_IDENTITY);
    getCurrentUserIdSpy.mockResolvedValue(USR_ID);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await permitController.updatePermit(req as any, res as any, next);

    expect(getCurrentIdentitySpy).toHaveBeenCalledTimes(1);
    expect(getCurrentIdentitySpy).toHaveBeenCalledWith(CURRENT_USER, NIL);
    expect(getCurrentUserIdSpy).toHaveBeenCalledTimes(1);
    expect(getCurrentUserIdSpy).toHaveBeenCalledWith(USR_IDENTITY, NIL);
    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith({ ...req.body, updatedBy: USR_ID });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  it('calls next if the permit service fails to update', async () => {
    const now = new Date();
    const req = {
      body: {
        permitType: 'ABC',
        permitTypeId: '123',
        activityId: 'ACT_ID',
        issuedPermitId: '1',
        trackingId: '2',
        authStatus: 'ACTIVE',
        needed: 'true',
        status: 'FOO',
        submittedDate: now,
        adjudicationDate: now
      },
      currentUser: CURRENT_USER
    };

    const USR_ID = 'abc-123';

    getCurrentUserIdSpy.mockResolvedValue(USR_ID);

    updateSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await permitController.updatePermit(req as any, res as any, next);

    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith({ ...req.body, updatedBy: USR_ID });
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
