import { TEST_CURRENT_CONTEXT, TEST_EMAIL_RESPONSE, TEST_NOTE_1, TEST_NOTE_HISTORY_1 } from '../data/index.ts';
import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import { sendRoadmapController } from '../../../src/controllers/roadmap.ts';
import { generateNullDeleteStamps, generateNullUpdateStamps } from '../../../src/db/utils/utils.ts';
import * as comsService from '../../../src/external/coms.ts';
import * as emailService from '../../../src/external/ches.ts';
import * as noteService from '../../../src/services/note.ts';
import * as noteHistoryService from '../../../src/services/noteHistory.ts';
import { uuidv4Pattern } from '../../../src/utils/regexp.ts';

import type { InternalAxiosRequestConfig } from 'axios';
import type { Request, Response } from 'express';
import type { Mock } from 'vitest';
import type { CurrentContext, Email, Note, NoteHistory } from '../../../src/types';

vi.mock('config');

const mockResponse = () => {
  const res: { locals: Record<string, unknown>; status?: Mock; json?: Mock; end?: Mock } = {
    locals: {}
  };
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.end = vi.fn().mockReturnValue(res);
  return res;
};

let res = mockResponse();
beforeEach(() => {
  res = mockResponse();
  res.locals.currentContext = TEST_CURRENT_CONTEXT;
});

afterEach(() => {
  vi.resetAllMocks();
});

describe('send', () => {
  const emailSpy = vi.spyOn(emailService, 'email');
  const getObjectSpy = vi.spyOn(comsService, 'getObject');
  const searchObjectSpy = vi.spyOn(comsService, 'searchObject');
  const createNoteSpy = vi.spyOn(noteService, 'createNote');
  const createHistorySpy = vi.spyOn(noteHistoryService, 'createNoteHistory');

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
      }
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
      }
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
      createdBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(createNoteSpy).toHaveBeenCalledTimes(1);
    expect(createNoteSpy).toHaveBeenCalledWith(prismaTxMock, {
      noteId: expect.stringMatching(uuidv4Pattern) as string,
      noteHistoryId: createdNote.noteHistoryId,
      note: createdNote.note,
      createdAt: expect.any(Date) as Date,
      createdBy: TEST_CURRENT_CONTEXT.userId,
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
        selectedFileIds: ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'],
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
      headers: {}
    };

    res.locals.currentContext = { ...TEST_CURRENT_CONTEXT, bearerToken: 'token' };

    const getObjectResponse = {
      data: 'foo',
      headers: {
        'content-type': 'filetype',
        'x-amz-meta-name': 'foo'
      },
      status: 200
    };

    const searchObjectResponse = {
      data: [{ name: 'foo' }],
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as InternalAxiosRequestConfig
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
    searchObjectSpy.mockResolvedValue(searchObjectResponse);
    emailSpy.mockResolvedValue(TEST_EMAIL_RESPONSE);

    await sendRoadmapController(
      req as unknown as Request<never, never, { activityId: string; selectedFileIds: string[]; emailData: Email }>,
      res as unknown as Response
    );

    expect(getObjectSpy).toHaveBeenCalledTimes(2);
    expect(getObjectSpy).toHaveBeenNthCalledWith(
      1,
      (res.locals.currentContext as unknown as CurrentContext).bearerToken,
      req.body.selectedFileIds[0]
    );
    expect(getObjectSpy).toHaveBeenNthCalledWith(
      2,
      (res.locals.currentContext as unknown as CurrentContext).bearerToken,
      req.body.selectedFileIds[1]
    );
    expect(emailSpy).toHaveBeenCalledTimes(1);
    expect(emailSpy).toHaveBeenCalledWith(req.body.emailData);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ ...createdHistory, note: [createdNote] });
  });

  it('should not call COMS without a bearer token', async () => {
    const req = {
      body: {
        activityId: 'ACTI1234',
        selectedFileIds: ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'],
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
        selectedFileIds: ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'],
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
      headers: {}
    };

    res.locals.currentContext = { ...TEST_CURRENT_CONTEXT, bearerToken: 'token' };

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

    const searchObjectResponse1 = {
      data: [{ name: 'foo' }],
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as InternalAxiosRequestConfig
    };

    const searchObjectResponse2 = {
      data: [{ name: 'bar' }],
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as InternalAxiosRequestConfig
    };

    const note1Name = `${searchObjectResponse1.data[0].name}`;
    const note2Name = `${searchObjectResponse2.data[0].name}`;

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
    searchObjectSpy.mockResolvedValueOnce(searchObjectResponse1);
    searchObjectSpy.mockResolvedValueOnce(searchObjectResponse2);

    await sendRoadmapController(
      req as unknown as Request<never, never, { activityId: string; selectedFileIds: string[]; emailData: Email }>,
      res as unknown as Response
    );

    expect(getObjectSpy).toHaveBeenCalledTimes(2);
    expect(getObjectSpy).toHaveBeenNthCalledWith(
      1,
      (res.locals.currentContext as unknown as CurrentContext).bearerToken,
      req.body.selectedFileIds[0]
    );
    expect(getObjectSpy).toHaveBeenNthCalledWith(
      2,
      (res.locals.currentContext as unknown as CurrentContext).bearerToken,
      req.body.selectedFileIds[1]
    );
    expect(emailSpy).toHaveBeenCalledTimes(1);
    expect(emailSpy).toHaveBeenCalledWith(req.body.emailData);
    expect(createHistorySpy).toHaveBeenCalledTimes(1);
    expect(createHistorySpy).toHaveBeenCalledWith(prismaTxMock, {
      ...createdHistory,
      noteHistoryId: expect.stringMatching(uuidv4Pattern) as string,
      createdAt: expect.any(Date) as Date,
      createdBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(createNoteSpy).toHaveBeenCalledTimes(1);
    expect(createNoteSpy).toHaveBeenCalledWith(prismaTxMock, {
      noteId: expect.stringMatching(uuidv4Pattern) as string,
      noteHistoryId: createdNote.noteHistoryId,
      note: createdNote.note,
      createdAt: expect.any(Date) as Date,
      createdBy: TEST_CURRENT_CONTEXT.userId,
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
