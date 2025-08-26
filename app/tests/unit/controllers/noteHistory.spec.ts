import {
  createNoteHistoryController,
  deleteNoteHistoryController,
  listBringForwardController,
  listNoteHistoryController,
  updateNoteHistoryController
} from '../../../src/controllers/noteHistory';
import * as electrificationProjectService from '../../../src/services/electrificationProject';
import * as enquiryService from '../../../src/services/enquiry';
import * as housingProjectService from '../../../src/services/housingProject';
import * as noteService from '../../../src/services/note';
import * as noteHistoryService from '../../../src/services/noteHistory';
import * as userService from '../../../src/services/user';
import { Initiative } from '../../../src/utils/enums/application';
import { BringForwardType } from '../../../src/utils/enums/projectCommon';
import { uuidv4Pattern } from '../../../src/utils/regexp';

import type { Request, Response } from 'express';
import type { ElectrificationProject, Enquiry, HousingProject, NoteHistory } from '../../../src/types';
import {
  TEST_CURRENT_CONTEXT,
  TEST_ELECTRIFICATION_PROJECT_1,
  TEST_IDIR_USER_1,
  TEST_NOTE_1,
  TEST_NOTE_HISTORY_1,
  TEST_NOTE_HISTORY_2
} from '../data';
import { prismaTxMock } from '../../__mocks__/prismaMock';
import { generateNullDeleteStamps, generateNullUpdateStamps } from '../../../src/db/utils/utils';

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

const CURRENT_AUTHORIZATION = {
  attributes: [] as Array<string>
};

TEST_CURRENT_CONTEXT.initiative = Initiative.ELECTRIFICATION;

describe('createNoteHistoryController', () => {
  const createHistorySpy = jest.spyOn(noteHistoryService, 'createNoteHistory');
  const createNoteSpy = jest.spyOn(noteService, 'createNote');

  it('should call services and respond with 201 and result', async () => {
    const req = {
      body: { ...TEST_NOTE_HISTORY_1, note: 'Some text' },
      currentContext: TEST_CURRENT_CONTEXT
    };

    createHistorySpy.mockResolvedValue(TEST_NOTE_HISTORY_1);
    createNoteSpy.mockResolvedValue(TEST_NOTE_1);

    await createNoteHistoryController(
      req as unknown as Request<never, never, NoteHistory & { note: string }>,
      res as unknown as Response
    );

    expect(createHistorySpy).toHaveBeenCalledTimes(1);
    expect(createHistorySpy).toHaveBeenCalledWith(prismaTxMock, {
      ...TEST_NOTE_HISTORY_1,
      noteHistoryId: expect.stringMatching(uuidv4Pattern),
      createdAt: expect.any(Date),
      createdBy: req.currentContext.userId
    });
    expect(createNoteSpy).toHaveBeenCalledTimes(1);
    expect(createNoteSpy).toHaveBeenCalledWith(prismaTxMock, {
      noteId: expect.stringMatching(uuidv4Pattern),
      noteHistoryId: TEST_NOTE_HISTORY_1.noteHistoryId,
      note: req.body.note,
      createdAt: expect.any(Date),
      createdBy: req.currentContext.userId,
      ...generateNullUpdateStamps(),
      ...generateNullDeleteStamps()
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ ...TEST_NOTE_HISTORY_1, note: [TEST_NOTE_1] });
  });
});

describe('deleteNoteHistoryController', () => {
  const deleteHistorySpy = jest.spyOn(noteHistoryService, 'deleteNoteHistory');

  it('should call services and respond with 204', async () => {
    const req = {
      params: { noteHistoryId: 'd9bc3e53-2aad-4160-903f-e62e31e0efd1' },
      currentContext: TEST_CURRENT_CONTEXT
    };

    deleteHistorySpy.mockResolvedValue();

    await deleteNoteHistoryController(req as unknown as Request<{ noteHistoryId: string }>, res as unknown as Response);

    expect(deleteHistorySpy).toHaveBeenCalledTimes(1);
    expect(deleteHistorySpy).toHaveBeenCalledWith(prismaTxMock, req.params.noteHistoryId, {
      deletedAt: expect.any(Date),
      deletedBy: req.currentContext.userId
    });
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalledWith();
  });
});

describe('listBringForwardController', () => {
  const listSpy = jest.spyOn(noteHistoryService, 'listBringForward');
  const searchElectrificationProjectsSpy = jest.spyOn(electrificationProjectService, 'searchElectrificationProjects');
  const searchHousingProjectsSpy = jest.spyOn(housingProjectService, 'searchHousingProjects');
  const searchEnquiries = jest.spyOn(enquiryService, 'searchEnquiries');
  const searchUsersSpy = jest.spyOn(userService, 'searchUsers');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      query: {
        bringForwardState: BringForwardType.UNRESOLVED
      },
      currentContext: TEST_CURRENT_CONTEXT
    };

    const NOTE_HISTORY_LIST: NoteHistory[] = [
      { ...TEST_NOTE_HISTORY_1, createdBy: '5e3f0c19-8664-4a43-ac9e-210da336e923' }
    ];

    const ENQUIRY_LIST: Enquiry[] = [];
    const ELECTRIFICATION_PROJECT_LIST: ElectrificationProject[] = [TEST_ELECTRIFICATION_PROJECT_1];
    const HOUSING_PROJECT_LIST: HousingProject[] = [];
    const USER_LIST = [TEST_IDIR_USER_1];

    listSpy.mockResolvedValue(NOTE_HISTORY_LIST);
    searchElectrificationProjectsSpy.mockResolvedValue(ELECTRIFICATION_PROJECT_LIST);
    searchHousingProjectsSpy.mockResolvedValue(HOUSING_PROJECT_LIST);
    searchEnquiries.mockResolvedValue(ENQUIRY_LIST);
    searchUsersSpy.mockResolvedValue(USER_LIST);

    await listBringForwardController(
      req as unknown as Request<never, never, never, { bringForwardState?: BringForwardType }>,
      res as unknown as Response
    );

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith(prismaTxMock, Initiative.ELECTRIFICATION, BringForwardType.UNRESOLVED);
    expect(searchElectrificationProjectsSpy).toHaveBeenCalledTimes(1);
    expect(searchElectrificationProjectsSpy).toHaveBeenCalledWith(prismaTxMock, { activityId: ['ACTI1234'] });
    expect(searchHousingProjectsSpy).toHaveBeenCalledTimes(1);
    expect(searchHousingProjectsSpy).toHaveBeenCalledWith(prismaTxMock, { activityId: ['ACTI1234'] });
    expect(searchUsersSpy).toHaveBeenCalledTimes(1);
    expect(searchUsersSpy).toHaveBeenCalledWith(prismaTxMock, { userId: ['5e3f0c19-8664-4a43-ac9e-210da336e923'] });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      {
        activityId: 'ACTI1234',
        noteId: 'd9bc3e53-2aad-4160-903f-e62e31e0efd1',
        electrificationProjectId: '5183f223-526a-44cf-8b6a-80f90c4e802b',
        housingProjectId: undefined,
        enquiryId: undefined,
        title: 'Title',
        projectName: 'NAME',
        createdByFullName: 'Doe, John',
        bringForwardDate: NOTE_HISTORY_LIST[0].bringForwardDate?.toISOString()
      }
    ]);
  });
});

describe('listNoteHistoryController', () => {
  const listNoteHistorySpy = jest.spyOn(noteHistoryService, 'listNoteHistory');

  const req = {
    params: { activityId: 'ACTI1234' },
    currentAuthorization: CURRENT_AUTHORIZATION,
    currentContext: TEST_CURRENT_CONTEXT
  };

  it('should call services and respond with 200 and result', async () => {
    const NOTE_HISTORY_LIST: NoteHistory[] = [TEST_NOTE_HISTORY_1];

    listNoteHistorySpy.mockResolvedValue(NOTE_HISTORY_LIST);

    await listNoteHistoryController(req as unknown as Request<{ activityId: string }>, res as unknown as Response);

    expect(listNoteHistorySpy).toHaveBeenCalledTimes(1);
    expect(listNoteHistorySpy).toHaveBeenCalledWith(prismaTxMock, req.params.activityId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(NOTE_HISTORY_LIST);
  });

  it('should filter results if scope:self and shownToProponent = true', async () => {
    req.currentAuthorization.attributes.push('scope:self');

    const NOTE_HISTORY_LIST: NoteHistory[] = [TEST_NOTE_HISTORY_1, TEST_NOTE_HISTORY_2];

    listNoteHistorySpy.mockResolvedValue(NOTE_HISTORY_LIST);

    await listNoteHistoryController(req as unknown as Request<{ activityId: string }>, res as unknown as Response);

    expect(listNoteHistorySpy).toHaveBeenCalledTimes(1);
    expect(listNoteHistorySpy).toHaveBeenCalledWith(prismaTxMock, req.params.activityId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([NOTE_HISTORY_LIST[1]]);
  });
});

describe('updateNoteHistoryController', () => {
  const createNoteSpy = jest.spyOn(noteService, 'createNote');
  const getNoteHistorySpy = jest.spyOn(noteHistoryService, 'getNoteHistory');
  const updateNoteHistorySpy = jest.spyOn(noteHistoryService, 'updateNoteHistory');

  const UPDATED_HISTORY: NoteHistory = { ...TEST_NOTE_HISTORY_1, title: 'New title' };

  it('should call services and respond with 200 and result', async () => {
    const req = {
      body: { ...UPDATED_HISTORY },
      currentContext: TEST_CURRENT_CONTEXT,
      params: {
        noteHistoryId: 'd9bc3e53-2aad-4160-903f-e62e31e0efd1'
      }
    };

    getNoteHistorySpy.mockResolvedValue(UPDATED_HISTORY);
    updateNoteHistorySpy.mockResolvedValue(UPDATED_HISTORY);

    await updateNoteHistoryController(
      req as unknown as Request<{ noteHistoryId: string }, never, NoteHistory & { note: string | undefined }>,
      res as unknown as Response
    );

    expect(updateNoteHistorySpy).toHaveBeenCalledTimes(1);
    expect(updateNoteHistorySpy).toHaveBeenCalledWith(prismaTxMock, {
      ...UPDATED_HISTORY,
      updatedAt: expect.any(Date),
      updatedBy: req.currentContext.userId
    });
    expect(getNoteHistorySpy).toHaveBeenCalledTimes(1);
    expect(getNoteHistorySpy).toHaveBeenCalledWith(prismaTxMock, req.params.noteHistoryId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(UPDATED_HISTORY);
  });

  it('creates a new note if given', async () => {
    const req = {
      body: { ...UPDATED_HISTORY, note: 'Some text' },
      currentContext: TEST_CURRENT_CONTEXT,
      params: {
        noteHistoryId: 'd9bc3e53-2aad-4160-903f-e62e31e0efd1'
      }
    };

    getNoteHistorySpy.mockResolvedValue(UPDATED_HISTORY);
    updateNoteHistorySpy.mockResolvedValue(UPDATED_HISTORY);

    await updateNoteHistoryController(
      req as unknown as Request<{ noteHistoryId: string }, never, NoteHistory & { note: string | undefined }>,
      res as unknown as Response
    );

    expect(createNoteSpy).toHaveBeenCalledTimes(1);
    expect(createNoteSpy).toHaveBeenCalledWith(prismaTxMock, {
      noteId: expect.stringMatching(uuidv4Pattern),
      noteHistoryId: req.params.noteHistoryId,
      note: req.body.note,
      createdAt: expect.any(Date),
      createdBy: req.currentContext.userId,
      ...generateNullUpdateStamps(),
      ...generateNullDeleteStamps()
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(UPDATED_HISTORY);
  });
});
