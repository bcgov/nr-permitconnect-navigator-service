import * as comsService from '../../../src/services/coms.ts';
import * as emailService from '../../../src/services/email.ts';
import * as noteHistoryService from '../../../src/services/noteHistory.ts';
import * as noteService from '../../../src/services/note.ts';
import { sendRoadmapController } from '../../../src/controllers/roadmap.ts';
import { TEST_CURRENT_CONTEXT, TEST_EMAIL_RESPONSE, TEST_NOTE_1, TEST_NOTE_HISTORY_1 } from '../data/index.ts';
import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import { uuidv4Pattern } from '../../../src/utils/regexp.ts';
import { generateNullDeleteStamps, generateNullUpdateStamps } from '../../../src/db/utils/utils.ts';

import type { Request, Response } from 'express';
import type { Email, Note, NoteHistory } from '../../../src/types';

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

describe('send', () => {
  const emailSpy = jest.spyOn(emailService, 'email');
  const getObjectSpy = jest.spyOn(comsService, 'getObject');
  const createNoteSpy = jest.spyOn(noteService, 'createNote');
  const createHistorySpy = jest.spyOn(noteHistoryService, 'createNoteHistory');

  it('should call services and respond with 201 and result', async () => {
    const req = {
      body: {
        activityId: 'ACTI1234',
        emailData: {
          body: 'Some message text',
          bodyType: 'text',
          from: 'test@gov.bc.ca',
          to: 'hello@gov.bc.ca',
          subject: 'Unit tests'
        }
      },
      currentContext: TEST_CURRENT_CONTEXT
    };

    const createdHistory: NoteHistory = {
      ...TEST_NOTE_HISTORY_1,
      type: 'Roadmap',
      title: 'Sent roadmap'
    };

    const createdNote: Note = {
      ...TEST_NOTE_1,
      note: req.body.emailData.body
    };

    createHistorySpy.mockResolvedValue(createdHistory);
    createNoteSpy.mockResolvedValue(createdNote);
    emailSpy.mockResolvedValue(TEST_EMAIL_RESPONSE);

    await sendRoadmapController(
      req as unknown as Request<never, never, { activityId: string; selectedFileIds: string[]; emailData: Email }>,
      res as unknown as Response
    );

    expect(getObjectSpy).toHaveBeenCalledTimes(0);
    expect(emailSpy).toHaveBeenCalledTimes(1);
    expect(emailSpy).toHaveBeenCalledWith(req.body.emailData);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ ...createdHistory, note: [createdNote] });
  });

  it('should create a note on success', async () => {
    const req = {
      body: {
        activityId: 'ACTI1234',
        emailData: {
          body: 'Some message text',
          bodyType: 'text',
          from: 'test@gov.bc.ca',
          to: 'hello@gov.bc.ca',
          subject: 'Unit tests'
        }
      },
      currentContext: TEST_CURRENT_CONTEXT
    };

    const createdHistory: NoteHistory = {
      ...TEST_NOTE_HISTORY_1,
      type: 'Roadmap',
      title: 'Sent roadmap'
    };

    const createdNote: Note = {
      ...TEST_NOTE_1,
      note: req.body.emailData.body
    };

    createHistorySpy.mockResolvedValue(createdHistory);
    createNoteSpy.mockResolvedValue(createdNote);
    emailSpy.mockResolvedValue(TEST_EMAIL_RESPONSE);

    await sendRoadmapController(
      req as unknown as Request<never, never, { activityId: string; selectedFileIds: string[]; emailData: Email }>,
      res as unknown as Response
    );

    expect(getObjectSpy).toHaveBeenCalledTimes(0);
    expect(emailSpy).toHaveBeenCalledTimes(1);
    expect(emailSpy).toHaveBeenCalledWith(req.body.emailData);
    expect(createHistorySpy).toHaveBeenCalledTimes(1);
    expect(createHistorySpy).toHaveBeenCalledWith(prismaTxMock, {
      ...createdHistory,
      noteHistoryId: expect.stringMatching(uuidv4Pattern) as string,
      createdAt: expect.any(Date) as Date,
      createdBy: req.currentContext.userId
    });
    expect(createNoteSpy).toHaveBeenCalledTimes(1);
    expect(createNoteSpy).toHaveBeenCalledWith(prismaTxMock, {
      noteId: expect.stringMatching(uuidv4Pattern) as string,
      noteHistoryId: createdNote.noteHistoryId,
      note: createdNote.note,
      createdAt: expect.any(Date) as Date,
      createdBy: req.currentContext.userId,
      ...generateNullUpdateStamps(),
      ...generateNullDeleteStamps()
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ ...createdHistory, note: [createdNote] });
  });

  it('should get coms objects and attach', async () => {
    const req = {
      body: {
        activityId: 'ACTI1234',
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
      currentContext: { ...TEST_CURRENT_CONTEXT, bearerToken: 'token' },
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

    const createdHistory: NoteHistory = {
      ...TEST_NOTE_HISTORY_1,
      type: 'Roadmap',
      title: 'Sent roadmap'
    };

    const createdNote: Note = {
      ...TEST_NOTE_1,
      note: req.body.emailData.body
    };

    createHistorySpy.mockResolvedValue(createdHistory);
    createNoteSpy.mockResolvedValue(createdNote);
    getObjectSpy.mockResolvedValue(getObjectResponse);
    emailSpy.mockResolvedValue(TEST_EMAIL_RESPONSE);

    await sendRoadmapController(
      req as unknown as Request<never, never, { activityId: string; selectedFileIds: string[]; emailData: Email }>,
      res as unknown as Response
    );

    expect(getObjectSpy).toHaveBeenCalledTimes(2);
    expect(getObjectSpy).toHaveBeenNthCalledWith(1, req.currentContext.bearerToken, req.body.selectedFileIds[0]);
    expect(getObjectSpy).toHaveBeenNthCalledWith(2, req.currentContext.bearerToken, req.body.selectedFileIds[1]);
    expect(emailSpy).toHaveBeenCalledTimes(1);
    expect(emailSpy).toHaveBeenCalledWith(req.body.emailData);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ ...createdHistory, note: [createdNote] });
  });

  it('should not call COMS without a bearer token', async () => {
    const req = {
      body: {
        activityId: 'ACTI1234',
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
      currentContext: { ...TEST_CURRENT_CONTEXT, bearerToken: null },
      headers: {}
    };

    const createdHistory: NoteHistory = {
      ...TEST_NOTE_HISTORY_1,
      type: 'Roadmap',
      title: 'Sent roadmap'
    };

    const createdNote: Note = {
      ...TEST_NOTE_1,
      note: req.body.emailData.body
    };

    createHistorySpy.mockResolvedValue(createdHistory);
    createNoteSpy.mockResolvedValue(createdNote);
    emailSpy.mockResolvedValue(TEST_EMAIL_RESPONSE);

    await sendRoadmapController(
      req as unknown as Request<never, never, { activityId: string; selectedFileIds: string[]; emailData: Email }>,
      res as unknown as Response
    );

    expect(getObjectSpy).toHaveBeenCalledTimes(0);
    expect(emailSpy).toHaveBeenCalledTimes(1);
    expect(emailSpy).toHaveBeenCalledWith(req.body.emailData);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ ...createdHistory, note: [createdNote] });
  });

  it('should append attachments to note', async () => {
    const req = {
      body: {
        activityId: 'ACTI1234',
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
      currentContext: { ...TEST_CURRENT_CONTEXT, bearerToken: 'token' },
      headers: {}
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

    const note1Name = `${getObjectResponse1.headers['x-amz-meta-name']}`;
    const note2Name = `${getObjectResponse2.headers['x-amz-meta-name']}`;

    const createdHistory: NoteHistory = {
      ...TEST_NOTE_HISTORY_1,
      type: 'Roadmap',
      title: 'Sent roadmap'
    };

    const createdNote: Note = {
      ...TEST_NOTE_1,
      note: `Some message text\n\nAttachments:\n${note1Name}\n${note2Name}\n`
    };

    createHistorySpy.mockResolvedValue(createdHistory);
    createNoteSpy.mockResolvedValue(createdNote);
    emailSpy.mockResolvedValue(TEST_EMAIL_RESPONSE);
    getObjectSpy.mockResolvedValueOnce(getObjectResponse1);
    getObjectSpy.mockResolvedValueOnce(getObjectResponse2);

    await sendRoadmapController(
      req as unknown as Request<never, never, { activityId: string; selectedFileIds: string[]; emailData: Email }>,
      res as unknown as Response
    );

    expect(getObjectSpy).toHaveBeenCalledTimes(2);
    expect(getObjectSpy).toHaveBeenNthCalledWith(1, req.currentContext.bearerToken, req.body.selectedFileIds[0]);
    expect(getObjectSpy).toHaveBeenNthCalledWith(2, req.currentContext.bearerToken, req.body.selectedFileIds[1]);
    expect(emailSpy).toHaveBeenCalledTimes(1);
    expect(emailSpy).toHaveBeenCalledWith(req.body.emailData);
    expect(createHistorySpy).toHaveBeenCalledTimes(1);
    expect(createHistorySpy).toHaveBeenCalledWith(prismaTxMock, {
      ...createdHistory,
      noteHistoryId: expect.stringMatching(uuidv4Pattern) as string,
      createdAt: expect.any(Date) as Date,
      createdBy: req.currentContext.userId
    });
    expect(createNoteSpy).toHaveBeenCalledTimes(1);
    expect(createNoteSpy).toHaveBeenCalledWith(prismaTxMock, {
      noteId: expect.stringMatching(uuidv4Pattern) as string,
      noteHistoryId: createdNote.noteHistoryId,
      note: createdNote.note,
      createdAt: expect.any(Date) as Date,
      createdBy: req.currentContext.userId,
      ...generateNullUpdateStamps(),
      ...generateNullDeleteStamps()
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      ...createdHistory,
      note: [createdNote]
    });
  });
});
