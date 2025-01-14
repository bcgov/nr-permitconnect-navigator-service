import { noteController } from '../../../src/controllers/index.ts';
import { enquiryService, noteService, submissionService, userService } from '../../../src/services/index.ts';

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

describe('createNote', () => {
  const next = jest.fn();

  // Mock service calls
  const createSpy = jest.spyOn(noteService, 'createNote');

  it('should return 201 if all good', async () => {
    const req = {
      body: {
        noteId: '123-123',
        activityId: '123',
        bringForwardDate: null,
        bringForwardState: null,
        note: 'Some not text',
        noteType: 'GENERAL',
        title: 'Note title'
      },
      currentContext: CURRENT_CONTEXT
    };

    const created = {
      noteId: '123-123',
      activityId: '123',
      bringForwardDate: null,
      bringForwardState: null,
      note: 'Some not text',
      noteType: 'GENERAL',
      title: 'Note title',
      isDeleted: false,
      createdAt: new Date().toISOString(),
      createdBy: 'abc-123'
    };

    createSpy.mockResolvedValue(created);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await noteController.createNote(req as any, res as any, next);

    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(createSpy).toHaveBeenCalledWith({
      ...req.body,
      createdAt: expect.stringMatching(isoPattern),
      createdBy: 'abc-123'
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(created);
  });

  it('calls next if the note service fails to create', async () => {
    const req = {
      body: {
        noteId: '123-123',
        activityId: '123',
        bringForwardDate: null,
        bringForwardState: null,
        note: 'Some not text',
        noteType: 'GENERAL',
        title: 'Note title'
      },
      currentContext: CURRENT_CONTEXT
    };

    createSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await noteController.createNote(req as any, res as any, next);

    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(createSpy).toHaveBeenCalledWith({
      ...req.body,
      createdAt: expect.stringMatching(isoPattern),
      createdBy: 'abc-123'
    });
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe('listBringForward', () => {
  const next = jest.fn();

  // Mock service calls
  const listSpy = jest.spyOn(noteService, 'listBringForward');
  const searchSubmissionsSpy = jest.spyOn(submissionService, 'searchSubmissions');
  const searchEnquiries = jest.spyOn(enquiryService, 'searchEnquiries');
  const searchUsersSpy = jest.spyOn(userService, 'searchUsers');

  it('should return 200 if all good', async () => {
    const req = {
      currentContext: CURRENT_CONTEXT,
      query: {}
    };

    const noteList = [
      {
        noteId: '123-123',
        activityId: '123',
        bringForwardDate: '2024-04-06 00:00:00.000 -0700',
        bringForwardState: 'Unresolved',
        note: 'Some text',
        noteType: 'Bring Forward',
        title: 'Test 1',
        createdBy: '11abbea6-2f3a-4ff3-8e55-b1e5290046f6',
        isDeleted: false
      }
    ];

    const enquiriesList = [
      {
        activityId: '123',
        projectName: 'Project ABC'
      }
    ];

    const submissionList = [
      {
        activityId: '123',
        projectName: 'Project ABC'
      }
    ];

    const userList = [
      {
        userId: '11abbea6-2f3a-4ff3-8e55-b1e5290046f6',
        fullName: 'Test User'
      }
    ];

    /* eslint-disable @typescript-eslint/no-explicit-any */
    listSpy.mockResolvedValue(noteList);
    searchSubmissionsSpy.mockResolvedValue(submissionList as any);
    searchEnquiries.mockResolvedValue(enquiriesList as any);
    searchUsersSpy.mockResolvedValue(userList as any);

    await noteController.listBringForward(req as any, res as any, next);
    /* eslint-enable @typescript-eslint/no-explicit-any */

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith(undefined);
    expect(searchSubmissionsSpy).toHaveBeenCalledTimes(1);
    expect(searchSubmissionsSpy).toHaveBeenCalledWith({ activityId: ['123'] });
    expect(searchUsersSpy).toHaveBeenCalledTimes(1);
    expect(searchUsersSpy).toHaveBeenCalledWith({ userId: ['11abbea6-2f3a-4ff3-8e55-b1e5290046f6'] });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      {
        activityId: '123',
        noteId: '123-123',
        title: 'Test 1',
        projectName: 'Project ABC',
        createdByFullName: 'Test User',
        bringForwardDate: '2024-04-06 00:00:00.000 -0700'
      }
    ]);
  });

  it('calls next if the note service fails to list bring forward notes', async () => {
    const req = {
      currentContext: CURRENT_CONTEXT,
      query: {}
    };

    listSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await noteController.listBringForward(req as any, res as any, next);

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith(undefined);
    expect(searchSubmissionsSpy).toHaveBeenCalledTimes(0);
    expect(searchUsersSpy).toHaveBeenCalledTimes(0);
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe('listNotes', () => {
  const next = jest.fn();

  // Mock service calls
  const listSpy = jest.spyOn(noteService, 'listNotes');

  it('should return 200 if all good', async () => {
    const req = {
      params: { activityId: 'ACT_ID' },
      currentContext: CURRENT_CONTEXT
    };

    const noteList = [
      {
        noteId: '123-123',
        activityId: '123',
        bringForwardDate: null,
        bringForwardState: null,
        note: 'Some not text',
        noteType: 'GENERAL',
        title: 'Note title',
        isDeleted: false
      }
    ];

    listSpy.mockResolvedValue(noteList);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await noteController.listNotes(req as any, res as any, next);

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith(req.params.activityId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(noteList);
  });

  it('calls next if the note service fails to list notes', async () => {
    const req = {
      params: { activityId: 'ACT_ID' },
      currentContext: CURRENT_CONTEXT
    };

    listSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await noteController.listNotes(req as any, res as any, next);

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith(req.params.activityId);
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe('deleteNote', () => {
  const next = jest.fn();

  // Mock service calls
  const deleteNoteSpy = jest.spyOn(noteService, 'deleteNote');

  it('should return 200 if deletion is successful', async () => {
    const req = {
      params: { noteId: '123-123' },
      currentContext: CURRENT_CONTEXT
    };

    const deletedNote = {
      noteId: '123-123',
      activityId: '123',
      bringForwardDate: null,
      bringForwardState: null,
      note: 'Some not text',
      noteType: 'GENERAL',
      title: 'Note title',
      isDeleted: true
    };

    deleteNoteSpy.mockResolvedValue(deletedNote);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await noteController.deleteNote(req as any, res as any, next);

    expect(deleteNoteSpy).toHaveBeenCalledTimes(1);
    expect(deleteNoteSpy).toHaveBeenCalledWith(req.params.noteId, {
      updatedAt: expect.stringMatching(isoPattern),
      updatedBy: 'abc-123'
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(deletedNote);
  });

  it('calls next if the note service fails to delete the note', async () => {
    const req = {
      params: { noteId: '123-123' },
      currentContext: CURRENT_CONTEXT
    };

    deleteNoteSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await noteController.deleteNote(req as any, res as any, next);

    expect(deleteNoteSpy).toHaveBeenCalledTimes(1);
    expect(deleteNoteSpy).toHaveBeenCalledWith(req.params.noteId, {
      updatedAt: expect.stringMatching(isoPattern),
      updatedBy: 'abc-123'
    });
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
describe('updateNote', () => {
  const next = jest.fn();

  // Mock service calls
  const updateNoteSpy = jest.spyOn(noteService, 'updateNote');

  it('should return 200 if update is successful', async () => {
    const req = {
      body: {
        noteId: '123-123',
        activityId: '123',
        bringForwardDate: null,
        bringForwardState: null,
        note: 'Updated note text',
        noteType: 'GENERAL',
        title: 'Updated Note title'
      },
      currentContext: CURRENT_CONTEXT
    };

    const updated = {
      noteId: '123-123',
      activityId: '123',
      bringForwardDate: null,
      bringForwardState: null,
      note: 'Updated note text',
      noteType: 'GENERAL',
      title: 'Updated Note title',
      isDeleted: false
    };

    updateNoteSpy.mockResolvedValue(updated);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await noteController.updateNote(req as any, res as any, next);

    expect(updateNoteSpy).toHaveBeenCalledTimes(1);
    expect(updateNoteSpy).toHaveBeenCalledWith({
      ...req.body,
      createdAt: expect.stringMatching(isoPattern),
      createdBy: 'abc-123',
      updatedAt: expect.stringMatching(isoPattern),
      updatedBy: 'abc-123'
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  it('calls next if the note service fails to update the note', async () => {
    const req = {
      body: {
        noteId: '123-123',
        activityId: '123',
        bringForwardDate: null,
        bringForwardState: null,
        note: 'Updated note text',
        noteType: 'GENERAL',
        title: 'Updated Note title'
      },
      currentContext: CURRENT_CONTEXT
    };

    updateNoteSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await noteController.updateNote(req as any, res as any, next);

    expect(updateNoteSpy).toHaveBeenCalledTimes(1);
    expect(updateNoteSpy).toHaveBeenCalledWith({
      ...req.body,
      createdAt: expect.stringMatching(isoPattern),
      createdBy: 'abc-123',
      updatedAt: expect.stringMatching(isoPattern),
      updatedBy: 'abc-123'
    });
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
