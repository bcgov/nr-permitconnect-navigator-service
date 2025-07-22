import { permitController } from '../../../src/controllers';
import { permitService } from '../../../src/services';
import { Initiative } from '../../../src/utils/enums/application';

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

const CURRENT_CONTEXT = { authType: 'BEARER', tokenPayload: null, userId: 'abc-123' };

const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

describe('upsertPermit', () => {
  const next = jest.fn();

  // Mock service calls
  const createSpy = jest.spyOn(permitService, 'upsertPermit');

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
        adjudicationDate: now,
        createdAt: new Date().toISOString(),
        createdBy: 'abc-123'
      },
      currentContext: CURRENT_CONTEXT
    };

    const created = {
      permitId: '12345',
      permitTypeId: 123,
      activityId: 'ACT_ID',
      issuedPermitId: '1',
      authStatus: 'ACTIVE',
      needed: 'true',
      status: 'FOO',
      submittedDate: now.toISOString(),
      adjudicationDate: now.toISOString(),
      statusLastVerified: now.toISOString(),
      permitType: null
    };

    createSpy.mockResolvedValue(created);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await permitController.upsertPermit(req as any, res as any, next);

    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(createSpy).toHaveBeenCalledWith({
      ...req.body,
      createdAt: expect.stringMatching(isoPattern),
      createdBy: 'abc-123',
      permitId: expect.any(String),
      updatedAt: expect.stringMatching(isoPattern),
      updatedBy: 'abc-123'
    });
    expect(res.status).toHaveBeenCalledWith(200);
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
        statusLastVerified: now.toISOString(),
        needed: 'true',
        status: 'FOO',
        submittedDate: now,
        adjudicationDate: now,
        createdAt: new Date().toISOString(),
        createdBy: 'abc-123',
        updatedAt: new Date().toISOString(),
        updatedBy: 'abc-123'
      },
      currentContext: CURRENT_CONTEXT
    };

    createSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await permitController.upsertPermit(req as any, res as any, next);

    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(createSpy).toHaveBeenCalledWith({
      ...req.body,
      permitId: expect.any(String),
      createdAt: expect.stringMatching(isoPattern),
      createdBy: 'abc-123',
      updatedAt: expect.stringMatching(isoPattern),
      updatedBy: 'abc-123'
    });
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
      currentContext: CURRENT_CONTEXT
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
      statusLastVerified: now.toISOString(),
      permitType: null
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
      currentContext: CURRENT_CONTEXT
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
      currentContext: CURRENT_CONTEXT,
      query: { initiative: Initiative.HOUSING }
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
        sourceSystem: 'CODE'
      }
    ];

    permitTypesSpy.mockResolvedValue(permitTypesList);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await permitController.getPermitTypes(req as any, res as any, next);

    expect(permitTypesSpy).toHaveBeenCalledTimes(1);
    expect(permitTypesSpy).toHaveBeenCalledWith(Initiative.HOUSING);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(permitTypesList);
  });

  it('calls next if the permit service fails to get permit types', async () => {
    const req = {
      currentContext: CURRENT_CONTEXT,
      query: { initiative: Initiative.HOUSING }
    };

    permitTypesSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await permitController.getPermitTypes(req as any, res as any, next);

    expect(permitTypesSpy).toHaveBeenCalledTimes(1);
    expect(permitTypesSpy).toHaveBeenCalledWith(Initiative.HOUSING);
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
      query: { activityId: 'ACT_ID' },
      currentContext: CURRENT_CONTEXT
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
        statusLastVerified: now.toISOString(),
        permitType: null
      }
    ];

    listSpy.mockResolvedValue(permitList);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await permitController.listPermits(req as any, res as any, next);

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith(req.query);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(permitList);
  });

  it('should return 200 and include notes if requested', async () => {
    const now = new Date();
    const req = {
      query: { activityId: 'ACT_ID', includeNotes: 'true' },
      currentContext: CURRENT_CONTEXT
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
        statusLastVerified: now.toISOString(),
        permitNotes: [
          {
            permitNoteId: 'NOTE123',
            permitId: '12345',
            note: 'A sample note',
            createdAt: now.toISOString(),
            createdBy: 'abc-123'
          }
        ],
        permitType: null
      }
    ];

    listSpy.mockResolvedValue(permitList);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await permitController.listPermits(req as any, res as any, next);

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith({
      activityId: 'ACT_ID',
      includeNotes: true
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(permitList);
  });

  it('calls next if the permit service fails to list permits', async () => {
    const req = {
      query: { activityId: 'ACT_ID' },
      currentContext: CURRENT_CONTEXT
    };

    listSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await permitController.listPermits(req as any, res as any, next);

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith(req.query);
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe('upsertPermit', () => {
  const next = jest.fn();

  // Mock service calls
  const updateSpy = jest.spyOn(permitService, 'upsertPermit');

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
      currentContext: CURRENT_CONTEXT
    };

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
      statusLastVerified: now.toISOString(),
      permitType: null
    };

    updateSpy.mockResolvedValue(updated);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await permitController.upsertPermit(req as any, res as any, next);

    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith({
      ...req.body,
      permitId: expect.any(String),
      updatedAt: expect.stringMatching(isoPattern),
      updatedBy: 'abc-123'
    });
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
      currentContext: CURRENT_CONTEXT
    };

    updateSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await permitController.upsertPermit(req as any, res as any, next);

    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith({
      ...req.body,
      permitId: expect.any(String),
      updatedAt: expect.stringMatching(isoPattern),
      updatedBy: 'abc-123'
    });
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
