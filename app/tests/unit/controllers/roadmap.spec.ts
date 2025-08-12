import * as comsService from '../../../src/services/coms';
import * as emailService from '../../../src/services/email';
import * as noteHistoryService from '../../../src/services/noteHistory';
import * as noteService from '../../../src/services/note';
import { sendRoadmapController } from '../../../src/controllers/roadmap';
import { isoPattern } from '../../../src/utils/regexp';

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

const CURRENT_CONTEXT = { authType: 'BEARER', bearerToken: 'sometoken', tokenPayload: null, userId: 'abc-123' };

describe('send', () => {
  const next = jest.fn();

  // Mock service calls
  const emailSpy = jest.spyOn(emailService, 'email');
  const getObjectSpy = jest.spyOn(comsService, 'getObject');
  const createNoteSpy = jest.spyOn(noteService, 'createNote');
  const createHistorySpy = jest.spyOn(noteHistoryService, 'createNoteHistory');

  it('should return 201 if all good', async () => {
    const req = {
      body: {
        activityId: '123-123',
        emailData: {
          body: 'Some message text',
          bodyType: 'text',
          from: 'test@gov.bc.ca',
          to: 'hello@gov.bc.ca',
          subject: 'Unit tests'
        }
      },
      currentContext: CURRENT_CONTEXT
    };

    const createdHistory = {
      activityId: req.body.activityId,
      bringForwardDate: null,
      bringForwardState: null,
      escalateToSupervisor: false,
      escalateToDirector: false,
      escalationType: null,
      noteHistoryId: '123',
      shownToProponent: false,
      title: 'Roadmap',
      type: 'Sent roadmap',
      isDeleted: false,
      createdAt: new Date(),
      createdBy: req.currentContext.userId,
      updatedAt: null,
      updatedBy: null
    };

    const createdNote = {
      noteId: '123',
      noteHistoryId: '123',
      note: req.body.emailData.body,
      createdAt: new Date(),
      createdBy: req.currentContext.userId,
      updatedAt: null,
      updatedBy: null
    };

    const emailResponse = {
      data: 'foo',
      status: 201
    };

    createHistorySpy.mockResolvedValue(createdHistory);
    createNoteSpy.mockResolvedValue(createdNote);
    emailSpy.mockResolvedValue(emailResponse);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await sendRoadmapController(req as any, res as any);

    expect(getObjectSpy).toHaveBeenCalledTimes(0);
    expect(emailSpy).toHaveBeenCalledTimes(1);
    expect(emailSpy).toHaveBeenCalledWith(req.body.emailData);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(emailResponse.data);
  });

  it('should create a note on success', async () => {
    const req = {
      body: {
        activityId: '123-123',
        emailData: {
          body: 'Some message text',
          bodyType: 'text',
          from: 'test@gov.bc.ca',
          to: 'hello@gov.bc.ca',
          subject: 'Unit tests'
        }
      },
      currentContext: CURRENT_CONTEXT
    };

    const emailResponse = {
      data: 'foo',
      status: 201
    };

    const createdHistory = {
      activityId: req.body.activityId,
      bringForwardDate: null,
      bringForwardState: null,
      escalateToSupervisor: false,
      escalateToDirector: false,
      escalationType: null,
      noteHistoryId: '123',
      shownToProponent: false,
      title: 'Sent roadmap',
      type: 'Roadmap',
      isDeleted: false,
      createdAt: new Date(),
      createdBy: req.currentContext.userId,
      updatedAt: null,
      updatedBy: null
    };

    const createdNote = {
      noteId: '123',
      noteHistoryId: '123',
      note: req.body.emailData.body,
      createdAt: new Date(),
      createdBy: req.currentContext.userId,
      updatedAt: null,
      updatedBy: null
    };

    createHistorySpy.mockResolvedValue(createdHistory);
    createNoteSpy.mockResolvedValue(createdNote);
    emailSpy.mockResolvedValue(emailResponse);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await sendRoadmapController(req as any, res as any);

    expect(getObjectSpy).toHaveBeenCalledTimes(0);
    expect(emailSpy).toHaveBeenCalledTimes(1);
    expect(emailSpy).toHaveBeenCalledWith(req.body.emailData);
    expect(createHistorySpy).toHaveBeenCalledTimes(1);
    expect(createHistorySpy).toHaveBeenCalledWith({
      activityId: req.body.activityId,
      bringForwardDate: null,
      bringForwardState: null,
      escalateToSupervisor: false,
      escalateToDirector: false,
      escalationType: null,
      shownToProponent: false,
      title: createdHistory.title,
      type: createdHistory.type,
      isDeleted: false,
      createdAt: expect.stringMatching(isoPattern),
      createdBy: createdHistory.createdBy
    });
    expect(createNoteSpy).toHaveBeenCalledTimes(1);
    expect(createNoteSpy).toHaveBeenCalledWith({ noteHistoryId: createdNote.noteHistoryId, note: createdNote.note });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(emailResponse.data);
  });

  it('should get coms objects and attach', async () => {
    const req = {
      body: {
        activityId: '123-123',
        selectedFileIds: ['123', '456'],
        emailData: {
          body: 'Some message text',
          bodyType: 'text',
          from: 'test@gov.bc.ca',
          to: 'hello@gov.bc.ca',
          subject: 'Unit tests',
          attachments: [
            {
              content: Buffer.from('foo').toString('base64'),
              contentType: 'filetype',
              encoding: 'base64',
              filename: 'foo'
            },
            {
              content: Buffer.from('foo').toString('base64'),
              contentType: 'filetype',
              encoding: 'base64',
              filename: 'bar'
            }
          ]
        }
      },
      currentContext: CURRENT_CONTEXT,
      headers: {}
    };

    const getObjectResponse = {
      data: 'foo',
      headers: {
        'content-type': 'filetype',
        'x-amz-meta-name': 'foo'
      },
      status: 200
    };

    const emailResponse = {
      data: 'foo',
      status: 201
    };

    const createdHistory = {
      activityId: req.body.activityId,
      bringForwardDate: null,
      bringForwardState: null,
      escalateToSupervisor: false,
      escalateToDirector: false,
      escalationType: null,
      noteHistoryId: '123',
      shownToProponent: false,
      title: 'Roadmap',
      type: 'Sent roadmap',
      isDeleted: false,
      createdAt: new Date(),
      createdBy: req.currentContext.userId,
      updatedAt: null,
      updatedBy: null
    };

    const createdNote = {
      noteId: '123',
      noteHistoryId: '123',
      note: req.body.emailData.body,
      createdAt: new Date(),
      createdBy: req.currentContext.userId,
      updatedAt: null,
      updatedBy: null
    };

    createHistorySpy.mockResolvedValue(createdHistory);
    createNoteSpy.mockResolvedValue(createdNote);
    getObjectSpy.mockResolvedValue(getObjectResponse);
    emailSpy.mockResolvedValue(emailResponse);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await sendRoadmapController(req as any, res as any);

    expect(getObjectSpy).toHaveBeenCalledTimes(2);
    expect(getObjectSpy).toHaveBeenNthCalledWith(1, req.currentContext.bearerToken, req.body.selectedFileIds[0]);
    expect(getObjectSpy).toHaveBeenNthCalledWith(2, req.currentContext.bearerToken, req.body.selectedFileIds[1]);
    expect(emailSpy).toHaveBeenCalledTimes(1);
    expect(emailSpy).toHaveBeenCalledWith(req.body.emailData);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(emailResponse.data);
  });

  it('should not call COMS without a bearer token', async () => {
    const req = {
      body: {
        activityId: '123-123',
        selectedFileIds: ['123', '456'],
        emailData: {
          body: 'Some message text',
          bodyType: 'text',
          from: 'test@gov.bc.ca',
          to: 'hello@gov.bc.ca',
          subject: 'Unit tests',
          attachments: [
            {
              content: Buffer.from('foo').toString('base64'),
              contentType: 'filetype',
              encoding: 'base64',
              filename: 'foo'
            },
            {
              content: Buffer.from('foo').toString('base64'),
              contentType: 'filetype',
              encoding: 'base64',
              filename: 'bar'
            }
          ]
        }
      },
      currentContext: { ...CURRENT_CONTEXT, bearerToken: null },
      headers: {}
    };

    const emailResponse = {
      data: 'foo',
      status: 201
    };

    const createdHistory = {
      activityId: req.body.activityId,
      bringForwardDate: null,
      bringForwardState: null,
      escalateToSupervisor: false,
      escalateToDirector: false,
      escalationType: null,
      noteHistoryId: '123',
      shownToProponent: false,
      title: 'Roadmap',
      type: 'Sent roadmap',
      isDeleted: false,
      createdAt: new Date(),
      createdBy: req.currentContext.userId,
      updatedAt: null,
      updatedBy: null
    };

    const createdNote = {
      noteId: '123',
      noteHistoryId: '123',
      note: req.body.emailData.body,
      createdAt: new Date(),
      createdBy: req.currentContext.userId,
      updatedAt: null,
      updatedBy: null
    };

    createHistorySpy.mockResolvedValue(createdHistory);
    createNoteSpy.mockResolvedValue(createdNote);
    emailSpy.mockResolvedValue(emailResponse);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await sendRoadmapController(req as any, res as any);

    expect(getObjectSpy).toHaveBeenCalledTimes(0);
    expect(emailSpy).toHaveBeenCalledTimes(1);
    expect(emailSpy).toHaveBeenCalledWith(req.body.emailData);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(emailResponse.data);
  });

  it('should append attachments to note', async () => {
    const req = {
      body: {
        activityId: '123-123',
        selectedFileIds: ['123', '456'],
        emailData: {
          body: 'Some message text',
          bodyType: 'text',
          from: 'test@gov.bc.ca',
          to: 'hello@gov.bc.ca',
          subject: 'Unit tests',
          attachments: [
            {
              content: Buffer.from('foo').toString('base64'),
              contentType: 'filetype',
              encoding: 'base64',
              filename: 'foo'
            },
            {
              content: Buffer.from('bar').toString('base64'),
              contentType: 'filetype',
              encoding: 'base64',
              filename: 'bar'
            }
          ]
        }
      },
      currentContext: CURRENT_CONTEXT,
      headers: {}
    };

    const emailResponse = {
      data: 'foo',
      status: 201
    };

    const getObjectResponse1 = {
      data: 'foo',
      headers: {
        'content-type': 'filetype',
        'x-amz-meta-name': 'foo'
      },
      status: 200
    };

    const getObjectResponse2 = {
      data: 'bar',
      headers: {
        'content-type': 'filetype',
        'x-amz-meta-name': 'bar'
      },
      status: 200
    };

    const note1 = `${getObjectResponse1.headers['x-amz-meta-name']}\n`;
    const note2 = `${getObjectResponse2.headers['x-amz-meta-name']}\n`;

    const createdHistory = {
      activityId: req.body.activityId,
      bringForwardDate: null,
      bringForwardState: null,
      escalateToSupervisor: false,
      escalateToDirector: false,
      escalationType: null,
      noteHistoryId: '123',
      shownToProponent: false,
      title: 'Sent roadmap',
      type: 'Roadmap',
      isDeleted: false,
      createdAt: new Date(),
      createdBy: req.currentContext.userId,
      updatedAt: null,
      updatedBy: null
    };

    const createdNote = {
      noteId: '123',
      noteHistoryId: '123',
      note: `Some message text\n\nAttachments:\n${getObjectsResponse[0].name}\n${getObjectsResponse[1].name}\n`,
      createdAt: new Date(),
      createdBy: req.currentContext.userId,
      updatedAt: null,
      updatedBy: null
    };

    createHistorySpy.mockResolvedValue(createdHistory);
    createNoteSpy.mockResolvedValue(createdNote);
    emailSpy.mockResolvedValue(emailResponse);
    getObjectSpy.mockResolvedValueOnce(getObjectResponse1);
    getObjectSpy.mockResolvedValueOnce(getObjectResponse2);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await sendRoadmapController(req as any, res as any);

    expect(getObjectSpy).toHaveBeenCalledTimes(2);
    expect(getObjectSpy).toHaveBeenNthCalledWith(1, req.currentContext.bearerToken, req.body.selectedFileIds[0]);
    expect(getObjectSpy).toHaveBeenNthCalledWith(2, req.currentContext.bearerToken, req.body.selectedFileIds[1]);
    expect(emailSpy).toHaveBeenCalledTimes(1);
    expect(emailSpy).toHaveBeenCalledWith(req.body.emailData);
    expect(createHistorySpy).toHaveBeenCalledTimes(1);
    expect(createHistorySpy).toHaveBeenCalledWith({
      activityId: req.body.activityId,
      bringForwardDate: null,
      bringForwardState: null,
      escalateToSupervisor: false,
      escalateToDirector: false,
      escalationType: null,
      shownToProponent: false,
      title: createdHistory.title,
      type: createdHistory.type,
      isDeleted: false,
      createdAt: expect.stringMatching(isoPattern),
      createdBy: createdHistory.createdBy
    });
    expect(createNoteSpy).toHaveBeenCalledTimes(1);
    expect(createNoteSpy).toHaveBeenCalledWith({ noteHistoryId: createdNote.noteHistoryId, note: createdNote.note });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(emailResponse.data);
  });

  it('should call next if COMS fails', async () => {
    const req = {
      body: {
        activityId: '123-123',
        selectedFileIds: ['123', '456'],
        emailData: {
          body: 'Some message text',
          bodyType: 'text',
          from: 'test@gov.bc.ca',
          to: 'hello@gov.bc.ca',
          subject: 'Unit tests',
          attachments: [
            {
              content: Buffer.from('foo').toString('base64'),
              contentType: 'filetype',
              encoding: 'base64',
              filename: 'foo'
            },
            {
              content: Buffer.from('foo').toString('base64'),
              contentType: 'filetype',
              encoding: 'base64',
              filename: 'bar'
            }
          ]
        }
      },
      currentContext: CURRENT_CONTEXT,
      headers: {}
    };

    getObjectSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await sendRoadmapController(req as any, res as any);

    expect(getObjectSpy).toHaveBeenCalledTimes(2);
    expect(getObjectSpy).toHaveBeenNthCalledWith(1, req.currentContext.bearerToken, req.body.selectedFileIds[0]);
    expect(getObjectSpy).toHaveBeenNthCalledWith(2, req.currentContext.bearerToken, req.body.selectedFileIds[1]);
    expect(emailSpy).toHaveBeenCalledTimes(0);
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should call next if a filename is not found', async () => {
    const req = {
      body: {
        activityId: '123-123',
        selectedFileIds: ['123', '456'],
        emailData: {
          body: 'Some message text',
          bodyType: 'text',
          from: 'test@gov.bc.ca',
          to: 'hello@gov.bc.ca',
          subject: 'Unit tests',
          attachments: [
            {
              content: Buffer.from('foo').toString('base64'),
              contentType: 'filetype',
              encoding: 'base64',
              filename: 'foo'
            },
            {
              content: Buffer.from('foo').toString('base64'),
              contentType: 'filetype',
              encoding: 'base64',
              filename: 'bar'
            }
          ]
        }
      },
      currentContext: CURRENT_CONTEXT,
      headers: {}
    };

    const getObjectResponse = {
      data: 'foo',
      headers: {
        'content-type': 'filetype'
      },
      status: 200
    };

    getObjectSpy.mockResolvedValue(getObjectResponse);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await sendRoadmapController(req as any, res as any);

    expect(getObjectSpy).toHaveBeenCalledTimes(2);
    expect(getObjectSpy).toHaveBeenNthCalledWith(1, req.currentContext.bearerToken, req.body.selectedFileIds[0]);
    expect(getObjectSpy).toHaveBeenNthCalledWith(2, req.currentContext.bearerToken, req.body.selectedFileIds[1]);
    expect(emailSpy).toHaveBeenCalledTimes(0);
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
