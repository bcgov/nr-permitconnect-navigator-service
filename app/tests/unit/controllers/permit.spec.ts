import {
  deletePermitController,
  getPermitTypesController,
  listPermitsController,
  upsertPermitController
} from '../../../src/controllers/permit';
import * as permitService from '../../../src/services/permit';
import { Permit, PermitType } from '../../../src/types';
import { Initiative } from '../../../src/utils/enums/application';
import { isoPattern, uuidv4Pattern } from '../../../src/utils/regexp';

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

const TEST_PERMIT: Permit = {
  permitId: '12345',
  permitTypeId: 123,
  activityId: 'ACT_ID',
  issuedPermitId: '1',
  authStatus: 'ACTIVE',
  needed: 'true',
  status: 'FOO',
  submittedDate: new Date(),
  adjudicationDate: new Date(),
  statusLastVerified: new Date(),
  createdAt: null,
  createdBy: null,
  updatedAt: null,
  updatedBy: null
};

const PERMIT_LIST: Permit[] = [TEST_PERMIT];

const TEST_PERMIT_TYPE: PermitType = {
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
  infoUrl: 'https://example.com/permit1',
  trackedInAts: true,
  sourceSystem: 'CODE',
  createdAt: null,
  createdBy: null,
  updatedAt: null,
  updatedBy: null
};

const PERMIT_TYPE_LIST: PermitType[] = [TEST_PERMIT_TYPE];

describe('deletePermit', () => {
  const next = jest.fn();

  // Mock service calls
  const deleteSpy = jest.spyOn(permitService, 'deletePermit');

  it('should return 200 if all good', async () => {
    const req = {
      params: { permitId: 'abc123' },
      currentContext: CURRENT_CONTEXT
    };

    deleteSpy.mockResolvedValue(TEST_PERMIT);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await deletePermitController(req as any, res as any);

    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(req.params.permitId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_PERMIT);
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
    await deletePermitController(req as any, res as any);

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

    permitTypesSpy.mockResolvedValue(PERMIT_TYPE_LIST);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await getPermitTypesController(req as any, res as any);

    expect(permitTypesSpy).toHaveBeenCalledTimes(1);
    expect(permitTypesSpy).toHaveBeenCalledWith(Initiative.HOUSING);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(PERMIT_TYPE_LIST);
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
    await getPermitTypesController(req as any, res as any);

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
    const req = {
      query: { activityId: 'ACT_ID' },
      currentContext: CURRENT_CONTEXT
    };

    listSpy.mockResolvedValue(PERMIT_LIST);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await listPermitsController(req as any, res as any);

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith(req.query);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(PERMIT_LIST);
  });

  it('should return 200 and include notes if requested', async () => {
    const now = new Date();
    const req = {
      query: { activityId: 'ACT_ID', includeNotes: 'true' },
      currentContext: CURRENT_CONTEXT
    };

    const permitList = [
      {
        ...TEST_PERMIT,
        permitNotes: [
          {
            permitNoteId: 'NOTE123',
            permitId: '12345',
            note: 'A sample note',
            createdAt: now.toISOString(),
            createdBy: 'abc-123'
          }
        ]
      }
    ];

    listSpy.mockResolvedValue(permitList);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await listPermitsController(req as any, res as any);

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
    await listPermitsController(req as any, res as any);

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

    updateSpy.mockResolvedValue(TEST_PERMIT);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await upsertPermitController(req as any, res as any);

    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith({
      ...req.body,
      permitId: expect.stringMatching(uuidv4Pattern),
      updatedAt: expect.stringMatching(isoPattern),
      updatedBy: 'abc-123'
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_PERMIT);
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
    await upsertPermitController(req as any, res as any);

    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith({
      ...req.body,
      permitId: expect.stringMatching(uuidv4Pattern),
      updatedAt: expect.stringMatching(isoPattern),
      updatedBy: 'abc-123'
    });
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
