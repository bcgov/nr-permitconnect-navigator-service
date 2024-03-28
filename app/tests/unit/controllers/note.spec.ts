import { NIL } from 'uuid';

import { noteController } from '../../../src/controllers';
import { noteService, submissionService, userService } from '../../../src/services';
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

describe('createNote', () => {
  const next = jest.fn();

  // Mock service calls
  const createSpy = jest.spyOn(noteService, 'createNote');
  const getCurrentIdentitySpy = jest.spyOn(utils, 'getCurrentIdentity');
  const getCurrentUserIdSpy = jest.spyOn(userService, 'getCurrentUserId');

  it('should return 200 if all good', async () => {
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
      currentUser: CURRENT_USER
    };

    const USR_IDENTITY = 'xxxy';
    const USR_ID = 'abc-123';

    const created = {
      noteId: '123-123',
      activityId: '123',
      bringForwardDate: null,
      bringForwardState: null,
      note: 'Some not text',
      noteType: 'GENERAL',
      title: 'Note title'
    };

    createSpy.mockResolvedValue(created);
    getCurrentIdentitySpy.mockReturnValue(USR_IDENTITY);
    getCurrentUserIdSpy.mockResolvedValue(USR_ID);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await noteController.createNote(req as any, res as any, next);

    expect(getCurrentIdentitySpy).toHaveBeenCalledTimes(1);
    expect(getCurrentIdentitySpy).toHaveBeenCalledWith(CURRENT_USER, NIL);
    expect(getCurrentUserIdSpy).toHaveBeenCalledTimes(1);
    expect(getCurrentUserIdSpy).toHaveBeenCalledWith(USR_IDENTITY, NIL);
    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(createSpy).toHaveBeenCalledWith({ ...req.body, createdBy: USR_ID });
    expect(res.status).toHaveBeenCalledWith(200);
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
      currentUser: CURRENT_USER
    };

    const USR_ID = 'abc-123';

    getCurrentUserIdSpy.mockResolvedValue(USR_ID);

    createSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await noteController.createNote(req as any, res as any, next);

    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(createSpy).toHaveBeenCalledWith({ ...req.body, createdBy: USR_ID });
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe('listBringForward', () => {
  const next = jest.fn();

  // Mock service calls
  const listSpy = jest.spyOn(noteService, 'listBringForward');
  const searchSubmissionsSpy = jest.spyOn(submissionService, 'searchSubmissions');
  const searchUsersSpy = jest.spyOn(userService, 'searchUsers');

  it('should return 200 if all good', async () => {
    const req = {
      currentUser: CURRENT_USER
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
        createdBy: '11abbea6-2f3a-4ff3-8e55-b1e5290046f6'
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
    searchUsersSpy.mockResolvedValue(userList as any);

    await noteController.listBringForward(req as any, res as any, next);
    /* eslint-enable @typescript-eslint/no-explicit-any */

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith();
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
      currentUser: CURRENT_USER
    };

    listSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await noteController.listBringForward(req as any, res as any, next);

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith();
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
      currentUser: CURRENT_USER
    };

    const noteList = [
      {
        noteId: '123-123',
        activityId: '123',
        bringForwardDate: null,
        bringForwardState: null,
        note: 'Some not text',
        noteType: 'GENERAL',
        title: 'Note title'
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
      currentUser: CURRENT_USER
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
