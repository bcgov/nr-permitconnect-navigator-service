import { noteHistoryController } from '../../../src/controllers';
import {
  electrificationProjectService,
  enquiryService,
  housingProjectService,
  noteService,
  noteHistoryService,
  userService
} from '../../../src/services';
import { ElectrificationProject, Enquiry, HousingProject } from '../../../src/types';
import { Initiative } from '../../../src/utils/enums/application';
import { BringForwardType, NoteType } from '../../../src/utils/enums/projectCommon';

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

const CURRENT_AUTHORIZATION = {
  attributes: [] as Array<string>
};

const CURRENT_CONTEXT = {
  authType: 'BEARER',
  tokenPayload: null,
  userId: '11abbea6-2f3a-4ff3-8e55-b1e5290046f6',
  initiative: Initiative.HOUSING
};

const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

describe('createNoteHistory', () => {
  const next = jest.fn();

  const req = {
    body: {
      activityId: '123',
      bringForwardDate: null,
      bringForwardState: null,
      escalateToSupervisor: false,
      escalateToDirector: false,
      note: 'Note text',
      shownToProponent: false,
      title: 'Title',
      type: NoteType.GENERAL
    },
    currentContext: CURRENT_CONTEXT
  };

  // Mock service calls
  const createHistorySpy = jest.spyOn(noteHistoryService, 'createNoteHistory');
  const createNoteSpy = jest.spyOn(noteService, 'createNote');

  it('should return 201 if all good', async () => {
    const createdHistory = {
      activityId: req.body.activityId,
      bringForwardDate: req.body.bringForwardDate,
      bringForwardState: req.body.bringForwardState,
      escalateToSupervisor: req.body.escalateToSupervisor,
      escalateToDirector: req.body.escalateToDirector,
      escalationType: null,
      noteHistoryId: '123',
      shownToProponent: req.body.shownToProponent,
      title: req.body.title,
      type: req.body.type,
      isDeleted: false,
      createdAt: new Date(),
      createdBy: req.currentContext.userId,
      updatedAt: null,
      updatedBy: null
    };

    const createdNote = {
      noteId: '123',
      noteHistoryId: '123',
      note: req.body.note,
      createdAt: new Date(),
      createdBy: req.currentContext.userId,
      updatedAt: null,
      updatedBy: null
    };

    createHistorySpy.mockResolvedValue(createdHistory);
    createNoteSpy.mockResolvedValue(createdNote);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await noteHistoryController.createNoteHistory(req as any, res as any, next);

    expect(createHistorySpy).toHaveBeenCalledTimes(1);
    expect(createHistorySpy).toHaveBeenCalledWith({
      activityId: req.body.activityId,
      bringForwardDate: req.body.bringForwardDate,
      bringForwardState: req.body.bringForwardState,
      escalateToSupervisor: req.body.escalateToSupervisor,
      escalateToDirector: req.body.escalateToDirector,
      shownToProponent: req.body.shownToProponent,
      title: req.body.title,
      type: req.body.type,
      isDeleted: false,
      createdAt: expect.stringMatching(isoPattern),
      createdBy: req.currentContext.userId
    });
    expect(createNoteSpy).toHaveBeenCalledTimes(1);
    expect(createNoteSpy).toHaveBeenCalledWith({
      noteHistoryId: createdHistory.noteHistoryId,
      note: req.body.note,
      createdAt: expect.stringMatching(isoPattern),
      createdBy: req.currentContext.userId
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ ...createdHistory, note: [createdNote] });
  });

  it('calls next if the note history service fails to create', async () => {
    createHistorySpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await noteHistoryController.createNoteHistory(req as any, res as any, next);

    expect(createHistorySpy).toHaveBeenCalledTimes(1);
    expect(createNoteSpy).toHaveBeenCalledTimes(0);
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe('deleteNoteHistory', () => {
  const next = jest.fn();

  const req = {
    params: { noteHistoryId: '123' },
    currentContext: CURRENT_CONTEXT
  };

  // Mock service calls
  const deleteHistorySpy = jest.spyOn(noteHistoryService, 'deleteNoteHistory');

  it('should return 200 if deletion is successful', async () => {
    const deletedNoteHistory = {
      activityId: '123',
      bringForwardDate: null,
      bringForwardState: null,
      escalateToDirector: false,
      escalateToSupervisor: false,
      escalationType: null,
      isDeleted: false,
      noteHistoryId: '123',
      shownToProponent: false,
      title: 'Title',
      type: NoteType.GENERAL,
      createdAt: new Date(),
      createdBy: req.currentContext.userId,
      updatedAt: new Date(),
      updatedBy: req.currentContext.userId
    };

    deleteHistorySpy.mockResolvedValue(deletedNoteHistory);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await noteHistoryController.deleteNoteHistory(req as any, res as any, next);

    expect(deleteHistorySpy).toHaveBeenCalledTimes(1);
    expect(deleteHistorySpy).toHaveBeenCalledWith(req.params.noteHistoryId, {
      updatedAt: expect.stringMatching(isoPattern),
      updatedBy: req.currentContext.userId
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(deletedNoteHistory);
  });

  it('calls next if the note service fails to delete the note', async () => {
    deleteHistorySpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await noteHistoryController.deleteNoteHistory(req as any, res as any, next);

    expect(deleteHistorySpy).toHaveBeenCalledTimes(1);
    expect(deleteHistorySpy).toHaveBeenCalledWith(req.params.noteHistoryId, {
      updatedAt: expect.stringMatching(isoPattern),
      updatedBy: req.currentContext.userId
    });
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe('listBringForward', () => {
  const next = jest.fn();

  // Mock service calls
  const listSpy = jest.spyOn(noteHistoryService, 'listBringForward');
  const searchElectrificationProjectsSpy = jest.spyOn(electrificationProjectService, 'searchElectrificationProjects');
  const searchHousingProjectsSpy = jest.spyOn(housingProjectService, 'searchHousingProjects');
  const searchEnquiries = jest.spyOn(enquiryService, 'searchEnquiries');
  const searchUsersSpy = jest.spyOn(userService, 'searchUsers');

  const req = {
    currentContext: CURRENT_CONTEXT,
    query: {}
  };

  it('should return 200 if all good', async () => {
    const noteList = [
      {
        activityId: '123',
        bringForwardDate: new Date(),
        bringForwardState: BringForwardType.UNRESOLVED,
        escalateToSupervisor: false,
        escalateToDirector: false,
        escalationType: null,
        note: [
          {
            noteId: '123',
            noteHistoryId: '123',
            note: 'Note text',
            createdAt: new Date(),
            createdBy: req.currentContext.userId,
            updatedAt: null,
            updatedBy: null
          }
        ],
        noteHistoryId: '123',
        shownToProponent: false,
        title: 'Title',
        type: NoteType.BRING_FORWARD,
        isDeleted: false,
        createdAt: new Date(),
        createdBy: req.currentContext.userId,
        updatedAt: null,
        updatedBy: null
      }
    ];

    const enquiriesList: Array<Enquiry> = [];

    const electrificationList: Array<ElectrificationProject> = [];

    const housingList: Array<Partial<HousingProject>> = [
      {
        activityId: '123',
        housingProjectId: '123',
        projectName: 'Project ABC'
      }
    ];

    const userList = [
      {
        userId: req.currentContext.userId,
        fullName: 'Test User'
      }
    ];

    /* eslint-disable @typescript-eslint/no-explicit-any */
    listSpy.mockResolvedValue(noteList);
    searchElectrificationProjectsSpy.mockResolvedValue(electrificationList as any);
    searchHousingProjectsSpy.mockResolvedValue(housingList as any);
    searchEnquiries.mockResolvedValue(enquiriesList as any);
    searchUsersSpy.mockResolvedValue(userList as any);

    await noteHistoryController.listBringForward(req as any, res as any, next);
    /* eslint-enable @typescript-eslint/no-explicit-any */

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith(Initiative.HOUSING, undefined);
    expect(searchElectrificationProjectsSpy).toHaveBeenCalledTimes(1);
    expect(searchElectrificationProjectsSpy).toHaveBeenCalledWith({ activityId: ['123'] });
    expect(searchHousingProjectsSpy).toHaveBeenCalledTimes(1);
    expect(searchHousingProjectsSpy).toHaveBeenCalledWith({ activityId: ['123'] });
    expect(searchUsersSpy).toHaveBeenCalledTimes(1);
    expect(searchUsersSpy).toHaveBeenCalledWith({ userId: ['11abbea6-2f3a-4ff3-8e55-b1e5290046f6'] });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      {
        activityId: '123',
        noteId: '123',
        electrificationProjectId: undefined,
        housingProjectId: '123',
        enquiryId: undefined,
        title: 'Title',
        projectName: 'Project ABC',
        createdByFullName: 'Test User',
        bringForwardDate: noteList[0].bringForwardDate.toISOString()
      }
    ]);
  });

  it('calls next if the note service fails to list bring forward notes', async () => {
    listSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await noteHistoryController.listBringForward(req as any, res as any, next);

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith(Initiative.HOUSING, undefined);
    expect(searchHousingProjectsSpy).toHaveBeenCalledTimes(0);
    expect(searchUsersSpy).toHaveBeenCalledTimes(0);
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe('listNoteHistory', () => {
  const next = jest.fn();

  // Mock service calls
  const listSpy = jest.spyOn(noteHistoryService, 'listNoteHistory');

  const req = {
    params: { activityId: '123' },
    currentAuthorization: CURRENT_AUTHORIZATION,
    currentContext: CURRENT_CONTEXT
  };

  it('should return 200 if all good', async () => {
    const noteList = [
      {
        activityId: '123',
        bringForwardDate: new Date(),
        bringForwardState: BringForwardType.UNRESOLVED,
        escalateToSupervisor: false,
        escalateToDirector: false,
        escalationType: null,
        note: [
          {
            noteId: '123',
            noteHistoryId: '123',
            note: 'Note text',
            createdAt: new Date(),
            createdBy: req.currentContext.userId,
            updatedAt: null,
            updatedBy: null
          }
        ],
        noteHistoryId: '123',
        shownToProponent: false,
        title: 'Title',
        type: NoteType.BRING_FORWARD,
        isDeleted: false,
        createdAt: new Date(),
        createdBy: req.currentContext.userId,
        updatedAt: null,
        updatedBy: null
      }
    ];

    listSpy.mockResolvedValue(noteList);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await noteHistoryController.listNoteHistory(req as any, res as any, next);

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith(req.params.activityId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(noteList);
  });

  it('should filter results if scope:self and shownToProponent = true', async () => {
    req.currentAuthorization.attributes.push('scope:self');

    const noteList = [
      {
        activityId: '123',
        bringForwardDate: new Date(),
        bringForwardState: BringForwardType.UNRESOLVED,
        escalateToSupervisor: false,
        escalateToDirector: false,
        escalationType: null,
        note: [
          {
            noteId: '123',
            noteHistoryId: '123',
            note: 'Note text',
            createdAt: new Date(),
            createdBy: req.currentContext.userId,
            updatedAt: null,
            updatedBy: null
          }
        ],
        noteHistoryId: '123',
        shownToProponent: true,
        title: 'Title',
        type: NoteType.BRING_FORWARD,
        isDeleted: false,
        createdAt: new Date(),
        createdBy: req.currentContext.userId,
        updatedAt: null,
        updatedBy: null
      },
      {
        activityId: '123',
        bringForwardDate: new Date(),
        bringForwardState: BringForwardType.UNRESOLVED,
        escalateToSupervisor: false,
        escalateToDirector: false,
        escalationType: null,
        note: [
          {
            noteId: '1234',
            noteHistoryId: '1234',
            note: 'Note text',
            createdAt: new Date(),
            createdBy: 'filter this',
            updatedAt: null,
            updatedBy: null
          }
        ],
        noteHistoryId: '1234',
        shownToProponent: false,
        title: 'Title',
        type: NoteType.BRING_FORWARD,
        isDeleted: false,
        createdAt: new Date(),
        createdBy: 'filter this',
        updatedAt: null,
        updatedBy: null
      }
    ];

    listSpy.mockResolvedValue(noteList);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await noteHistoryController.listNoteHistory(req as any, res as any, next);

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith(req.params.activityId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([noteList[0]]);
  });

  it('calls next if the note service fails to list notes', async () => {
    listSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await noteHistoryController.listNoteHistory(req as any, res as any, next);

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith(req.params.activityId);
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe('updateNoteHistory', () => {
  const next = jest.fn();

  // Mock service calls
  const createNoteSpy = jest.spyOn(noteService, 'createNote');
  const getNoteHistorySpy = jest.spyOn(noteHistoryService, 'getNoteHistory');
  const updateNoteHistorySpy = jest.spyOn(noteHistoryService, 'updateNoteHistory');

  const req = {
    body: {
      activityId: '123',
      bringForwardDate: null,
      bringForwardState: null,
      escalateToSupervisor: false,
      escalateToDirector: false,
      escalationType: null,
      note: undefined as string | undefined,
      shownToProponent: false,
      title: 'Title',
      type: NoteType.GENERAL
    },
    currentContext: CURRENT_CONTEXT,
    params: {
      noteHistoryId: '123'
    }
  };

  it('should return 200 if update is successful', async () => {
    const updatedHistory = {
      activityId: req.body.activityId,
      bringForwardDate: req.body.bringForwardDate,
      bringForwardState: req.body.bringForwardState,
      escalateToSupervisor: req.body.escalateToSupervisor,
      escalateToDirector: req.body.escalateToDirector,
      escalationType: req.body.escalationType,
      noteHistoryId: req.params.noteHistoryId,
      shownToProponent: req.body.shownToProponent,
      title: req.body.title,
      type: req.body.type,
      isDeleted: false,
      createdAt: new Date(),
      createdBy: req.currentContext.userId,
      updatedAt: new Date(),
      updatedBy: req.currentContext.userId
    };

    const list = {
      ...updatedHistory,
      note: [
        {
          noteId: '123',
          noteHistoryId: '123',
          note: 'Note text',
          createdAt: new Date(),
          createdBy: req.currentContext.userId,
          updatedAt: null,
          updatedBy: null
        }
      ]
    };

    getNoteHistorySpy.mockResolvedValue(list);
    updateNoteHistorySpy.mockResolvedValue(updatedHistory);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await noteHistoryController.updateNoteHistory(req as any, res as any, next);

    expect(updateNoteHistorySpy).toHaveBeenCalledTimes(1);
    expect(updateNoteHistorySpy).toHaveBeenCalledWith({
      activityId: req.body.activityId,
      bringForwardDate: req.body.bringForwardDate,
      bringForwardState: req.body.bringForwardState,
      escalateToSupervisor: req.body.escalateToSupervisor,
      escalateToDirector: req.body.escalateToDirector,
      escalationType: req.body.escalationType,
      noteHistoryId: req.params.noteHistoryId,
      shownToProponent: req.body.shownToProponent,
      title: req.body.title,
      type: req.body.type,
      isDeleted: false,
      updatedAt: expect.stringMatching(isoPattern),
      updatedBy: req.currentContext.userId
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(list);
  });

  it('calls next if the note service fails to update the note', async () => {
    updateNoteHistorySpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await noteHistoryController.updateNoteHistory(req as any, res as any, next);

    expect(updateNoteHistorySpy).toHaveBeenCalledTimes(1);
    expect(updateNoteHistorySpy).toHaveBeenCalledWith({
      activityId: req.body.activityId,
      bringForwardDate: req.body.bringForwardDate,
      bringForwardState: req.body.bringForwardState,
      escalateToSupervisor: req.body.escalateToSupervisor,
      escalateToDirector: req.body.escalateToDirector,
      escalationType: req.body.escalationType,
      noteHistoryId: req.params.noteHistoryId,
      shownToProponent: req.body.shownToProponent,
      title: req.body.title,
      type: req.body.type,
      isDeleted: false,
      updatedAt: expect.stringMatching(isoPattern),
      updatedBy: req.currentContext.userId
    });
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('creates a new note if given', async () => {
    req.body.note = 'Note text';

    const updatedHistory = {
      activityId: req.body.activityId,
      bringForwardDate: req.body.bringForwardDate,
      bringForwardState: req.body.bringForwardState,
      escalateToSupervisor: req.body.escalateToSupervisor,
      escalateToDirector: req.body.escalateToDirector,
      escalationType: req.body.escalationType,
      noteHistoryId: req.params.noteHistoryId,
      shownToProponent: req.body.shownToProponent,
      title: req.body.title,
      type: req.body.type,
      isDeleted: false,
      createdAt: new Date(),
      createdBy: req.currentContext.userId,
      updatedAt: new Date(),
      updatedBy: req.currentContext.userId
    };

    const createdNote = {
      noteId: '123',
      noteHistoryId: '123',
      note: req.body.note,
      createdAt: new Date(),
      createdBy: req.currentContext.userId,
      updatedAt: null,
      updatedBy: null
    };

    const list = {
      ...updatedHistory,
      note: [createdNote]
    };

    getNoteHistorySpy.mockResolvedValue(list);
    updateNoteHistorySpy.mockResolvedValue(updatedHistory);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await noteHistoryController.updateNoteHistory(req as any, res as any, next);

    expect(createNoteSpy).toHaveBeenCalledTimes(1);
    expect(createNoteSpy).toHaveBeenCalledWith({
      noteHistoryId: req.params.noteHistoryId,
      note: req.body.note,
      createdAt: expect.stringMatching(isoPattern),
      createdBy: req.currentContext.userId
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(list);
  });
});
