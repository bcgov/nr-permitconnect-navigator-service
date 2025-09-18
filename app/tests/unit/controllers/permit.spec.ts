import { TEST_CURRENT_CONTEXT, TEST_PERMIT_1, TEST_PERMIT_LIST, TEST_PERMIT_TYPE_LIST } from '../data';
import { prismaTxMock } from '../../__mocks__/prismaMock';
import {
  deletePermitController,
  getPermitController,
  getPermitTypesController,
  listPermitsController,
  upsertPermitController
} from '../../../src/controllers/permit';
import * as permitService from '../../../src/services/permit';
import { Initiative } from '../../../src/utils/enums/application';
import { uuidv4Pattern } from '../../../src/utils/regexp';
import { PermitNeeded, PermitStage, PermitState } from '../../../src/utils/enums/permit';

import type { Request, Response } from 'express';
import type { ListPermitsOptions, Permit } from '../../../src/types';

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

describe('deletePermitController', () => {
  const deleteSpy = jest.spyOn(permitService, 'deletePermit');

  it('should call services and respond with 204', async () => {
    const req = {
      params: { permitId: '1381438d-0c7a-46bf-8ae2-d1febbf27066' },
      currentContext: TEST_CURRENT_CONTEXT
    };

    deleteSpy.mockResolvedValue();

    await deletePermitController(req as unknown as Request<{ permitId: string }>, res as unknown as Response);

    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(prismaTxMock, req.params.permitId);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalledWith();
  });
});

describe('getPermitController', () => {
  const getSpy = jest.spyOn(permitService, 'getPermit');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      currentContext: TEST_CURRENT_CONTEXT,
      params: { permitId: '1381438d-0c7a-46bf-8ae2-d1febbf27066' }
    };

    getSpy.mockResolvedValue(TEST_PERMIT_1);

    await getPermitController(req as unknown as Request<{ permitId: string }>, res as unknown as Response);

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith(prismaTxMock, '1381438d-0c7a-46bf-8ae2-d1febbf27066');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_PERMIT_1);
  });
});

describe('getPermitTypesController', () => {
  const permitTypesSpy = jest.spyOn(permitService, 'getPermitTypes');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      currentContext: TEST_CURRENT_CONTEXT,
      query: { initiative: Initiative.HOUSING }
    };

    permitTypesSpy.mockResolvedValue(TEST_PERMIT_TYPE_LIST);

    await getPermitTypesController(
      req as unknown as Request<never, never, never, { initiative: Initiative }>,
      res as unknown as Response
    );

    expect(permitTypesSpy).toHaveBeenCalledTimes(1);
    expect(permitTypesSpy).toHaveBeenCalledWith(prismaTxMock, Initiative.HOUSING);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_PERMIT_TYPE_LIST);
  });
});

describe('listPermitsController', () => {
  const listSpy = jest.spyOn(permitService, 'listPermits');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      query: { activityId: 'ACTI1234' },
      currentContext: TEST_CURRENT_CONTEXT
    };

    listSpy.mockResolvedValue(TEST_PERMIT_LIST);

    await listPermitsController(
      req as unknown as Request<never, never, never, Partial<ListPermitsOptions>>,
      res as unknown as Response
    );

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith(prismaTxMock, req.query);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_PERMIT_LIST);
  });

  it('should include notes if requested', async () => {
    const now = new Date();
    const req = {
      query: { activityId: 'ACTI1234', includeNotes: 'true' },
      currentContext: TEST_CURRENT_CONTEXT
    };

    const permitList = [
      {
        ...TEST_PERMIT_1,
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

    await listPermitsController(
      req as unknown as Request<never, never, never, Partial<ListPermitsOptions>>,
      res as unknown as Response
    );

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith(prismaTxMock, {
      activityId: 'ACTI1234',
      includeNotes: true
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(permitList);
  });
});

describe('upsertPermitController', () => {
  const upsertSpy = jest.spyOn(permitService, 'upsertPermit');

  it('should call services and respond with 200 and result', async () => {
    const now = new Date();
    const req = {
      body: {
        permitType: 'ABC',
        permitTypeId: 1,
        activityId: '165E5F7F',
        issuedPermitId: '1',
        trackingId: '2',
        state: PermitState.IN_PROGRESS,
        needed: PermitNeeded.YES,
        stage: PermitStage.PRE_SUBMISSION,
        submittedDate: now,
        adjudicationDate: now
      },
      currentContext: TEST_CURRENT_CONTEXT
    };

    upsertSpy.mockResolvedValue(TEST_PERMIT_1);

    await upsertPermitController(req as unknown as Request<never, never, Permit>, res as unknown as Response);

    expect(upsertSpy).toHaveBeenCalledTimes(1);
    expect(upsertSpy).toHaveBeenCalledWith(prismaTxMock, {
      ...req.body,
      permitId: expect.stringMatching(uuidv4Pattern),
      permitNote: undefined,
      permitTracking: undefined,
      createdAt: expect.any(Date),
      createdBy: TEST_CURRENT_CONTEXT.userId,
      updatedAt: expect.any(Date),
      updatedBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_PERMIT_1);
  });
});
