import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import { TEST_CURRENT_CONTEXT, TEST_PERMIT_NOTE_1, TEST_PERMIT_1, TEST_HOUSING_PROJECT_1 } from '../data/index.ts';
import { createPermitNoteController } from '../../../src/controllers/permitNote.ts';
import * as housingProjectService from '../../../src/services/housingProject.ts';
import * as permitService from '../../../src/services/permit.ts';
import * as permitNoteService from '../../../src/services/permitNote.ts';
import * as projectService from '../../../src/services/project.ts';
import * as sourceSystemKindService from '../../../src/services/sourceSystemKind.ts';
import { uuidv4Pattern } from '../../../src/utils/regexp.ts';
import { Initiative } from '../../../src/utils/enums/application.ts';

import type { Request, Response } from 'express';
import type { PermitNote } from '../../../src/types/index.ts';

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

// Set an initiative for the context
TEST_CURRENT_CONTEXT.initiative = Initiative.HOUSING;

describe('createPermitNoteController', () => {
  const createPermitNoteSpy = jest.spyOn(permitNoteService, 'createPermitNote');
  const getPermitSpy = jest.spyOn(permitService, 'getPermit');
  const searchHousingProjectsSpy = jest.spyOn(housingProjectService, 'searchHousingProjects');
  const getSourceSystemKindsSpy = jest.spyOn(sourceSystemKindService, 'getSourceSystemKinds');
  const getProjectByActivityIdSpy = jest.spyOn(projectService, 'getProjectByActivityId');

  it('should call services and respond with 201 and result', async () => {
    const req = {
      body: {
        permitId: 'a752026b-2899-4603-b56b-aa3c9b53ed20',
        note: 'This is a permit note'
      },
      currentContext: TEST_CURRENT_CONTEXT
    };

    getPermitSpy.mockResolvedValue({ ...TEST_PERMIT_1, createdAt: new Date() });
    searchHousingProjectsSpy.mockResolvedValue([]);
    getSourceSystemKindsSpy.mockResolvedValue([]);
    getProjectByActivityIdSpy.mockResolvedValue(TEST_HOUSING_PROJECT_1);
    createPermitNoteSpy.mockResolvedValue(TEST_PERMIT_NOTE_1);

    await createPermitNoteController(req as unknown as Request<never, never, PermitNote>, res as unknown as Response);

    expect(createPermitNoteSpy).toHaveBeenCalledTimes(1);
    expect(createPermitNoteSpy).toHaveBeenCalledWith(prismaTxMock, {
      ...req.body,
      permitNoteId: expect.stringMatching(uuidv4Pattern) as string,
      createdAt: expect.any(Date) as Date,
      createdBy: req.currentContext.userId
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      ...TEST_PERMIT_NOTE_1,
      permitNoteId: expect.stringMatching(uuidv4Pattern) as string
    });
  });
});
