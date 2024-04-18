import { NIL } from 'uuid';

import * as utils from '../../../src/components/utils';
import { roadmapController } from '../../../src/controllers';
import { comsService, emailService, noteService, userService } from '../../../src/services';

import type { Note } from '../../../src/types';

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

describe('send', () => {
  const next = jest.fn();

  // Mock service calls
  const emailSpy = jest.spyOn(emailService, 'email');
  const getCurrentIdentitySpy = jest.spyOn(utils, 'getCurrentIdentity');
  const getCurrentUserIdSpy = jest.spyOn(userService, 'getCurrentUserId');
  const getObjectSpy = jest.spyOn(comsService, 'getObject');
  const getObjectsSpy = jest.spyOn(comsService, 'getObjects');
  const createNoteSpy = jest.spyOn(noteService, 'createNote');

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
      currentUser: CURRENT_USER
    };

    const noteCreate: Note = {
      activityId: '123-123',
      note: 'Some message text',
      noteType: 'Roadmap',
      title: 'Sent roadmap',
      bringForwardDate: null,
      bringForwardState: null,
      createdAt: new Date().toISOString(),
      createdBy: 'abc-123',
      isDeleted: false
    };

    const emailResponse = {
      data: 'foo',
      status: 201
    };

    const USR_IDENTITY = 'xxxy';
    const USR_ID = 'abc-123';

    createNoteSpy.mockResolvedValue(noteCreate);
    emailSpy.mockResolvedValue(emailResponse);
    getCurrentIdentitySpy.mockReturnValue(USR_IDENTITY);
    getCurrentUserIdSpy.mockResolvedValue(USR_ID);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await roadmapController.send(req as any, res as any, next);

    expect(getObjectsSpy).toHaveBeenCalledTimes(0);
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
      currentUser: CURRENT_USER
    };

    const emailResponse = {
      data: 'foo',
      status: 201
    };

    const noteCreate: Note = {
      activityId: '123-123',
      note: 'Some message text',
      noteType: 'Roadmap',
      title: 'Sent roadmap',
      bringForwardDate: null,
      bringForwardState: null,
      createdAt: new Date().toISOString(),
      createdBy: 'abc-123',
      isDeleted: false
    };

    const USR_IDENTITY = 'xxxy';
    const USR_ID = 'abc-123';

    const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

    createNoteSpy.mockResolvedValue(noteCreate);
    emailSpy.mockResolvedValue(emailResponse);
    getCurrentIdentitySpy.mockReturnValue(USR_IDENTITY);
    getCurrentUserIdSpy.mockResolvedValue(USR_ID);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await roadmapController.send(req as any, res as any, next);

    expect(getObjectsSpy).toHaveBeenCalledTimes(0);
    expect(getObjectSpy).toHaveBeenCalledTimes(0);
    expect(emailSpy).toHaveBeenCalledTimes(1);
    expect(emailSpy).toHaveBeenCalledWith(req.body.emailData);
    expect(getCurrentIdentitySpy).toHaveBeenCalledTimes(1);
    expect(getCurrentIdentitySpy).toHaveBeenCalledWith(CURRENT_USER, NIL);
    expect(getCurrentUserIdSpy).toHaveBeenCalledTimes(1);
    expect(getCurrentUserIdSpy).toHaveBeenCalledWith(USR_IDENTITY, NIL);
    expect(createNoteSpy).toHaveBeenCalledTimes(1);
    expect(createNoteSpy).toHaveBeenCalledWith(
      expect.objectContaining({ ...noteCreate, createdAt: expect.stringMatching(isoPattern) })
    );
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
      currentUser: CURRENT_USER,
      headers: {}
    };

    const getObjectsResponse = [
      { id: '123', name: 'foo' },
      { id: '456', name: 'bar' }
    ];

    const getObjectResponse = {
      data: 'foo',
      headers: {
        'content-type': 'filetype'
      },
      status: 200
    };

    const emailResponse = {
      data: 'foo',
      status: 201
    };

    getObjectsSpy.mockResolvedValue(getObjectsResponse);
    getObjectSpy.mockResolvedValue(getObjectResponse);
    emailSpy.mockResolvedValue(emailResponse);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await roadmapController.send(req as any, res as any, next);

    expect(getObjectsSpy).toHaveBeenCalledTimes(1);
    expect(getObjectsSpy).toHaveBeenNthCalledWith(1, req.headers, req.body.selectedFileIds);
    expect(getObjectSpy).toHaveBeenCalledTimes(2);
    expect(getObjectSpy).toHaveBeenNthCalledWith(1, req.headers, req.body.selectedFileIds[0]);
    expect(getObjectSpy).toHaveBeenNthCalledWith(2, req.headers, req.body.selectedFileIds[1]);
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
              content: Buffer.from('foo').toString('base64'),
              contentType: 'filetype',
              encoding: 'base64',
              filename: 'bar'
            }
          ]
        }
      },
      currentUser: CURRENT_USER,
      headers: {}
    };

    const emailResponse = {
      data: 'foo',
      status: 201
    };

    const getObjectsResponse = [
      { id: '123', name: 'foo' },
      { id: '456', name: 'bar' }
    ];

    const getObjectResponse = {
      data: 'foo',
      headers: {
        'content-type': 'filetype'
      },
      status: 200
    };

    const noteCreate: Note = {
      activityId: '123-123',
      note: `Some message text\n\nAttachments:\n${getObjectsResponse[0].name}\n${getObjectsResponse[1].name}\n`,
      noteType: 'Roadmap',
      title: 'Sent roadmap',
      bringForwardDate: null,
      bringForwardState: null,
      createdAt: new Date().toISOString(),
      createdBy: 'abc-123',
      isDeleted: false
    };

    const USR_IDENTITY = 'xxxy';
    const USR_ID = 'abc-123';

    const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

    createNoteSpy.mockResolvedValue(noteCreate);
    emailSpy.mockResolvedValue(emailResponse);
    getCurrentIdentitySpy.mockReturnValue(USR_IDENTITY);
    getCurrentUserIdSpy.mockResolvedValue(USR_ID);
    getObjectsSpy.mockResolvedValue(getObjectsResponse);
    getObjectSpy.mockResolvedValue(getObjectResponse);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await roadmapController.send(req as any, res as any, next);

    expect(getObjectsSpy).toHaveBeenCalledTimes(1);
    expect(getObjectsSpy).toHaveBeenNthCalledWith(1, req.headers, req.body.selectedFileIds);
    expect(getObjectSpy).toHaveBeenCalledTimes(2);
    expect(getObjectSpy).toHaveBeenNthCalledWith(1, req.headers, req.body.selectedFileIds[0]);
    expect(getObjectSpy).toHaveBeenNthCalledWith(2, req.headers, req.body.selectedFileIds[1]);
    expect(emailSpy).toHaveBeenCalledTimes(1);
    expect(emailSpy).toHaveBeenCalledWith(req.body.emailData);
    expect(getCurrentIdentitySpy).toHaveBeenCalledTimes(1);
    expect(getCurrentIdentitySpy).toHaveBeenCalledWith(CURRENT_USER, NIL);
    expect(getCurrentUserIdSpy).toHaveBeenCalledTimes(1);
    expect(getCurrentUserIdSpy).toHaveBeenCalledWith(USR_IDENTITY, NIL);
    expect(createNoteSpy).toHaveBeenCalledTimes(1);
    expect(createNoteSpy).toHaveBeenCalledWith(
      expect.objectContaining({ ...noteCreate, createdAt: expect.stringMatching(isoPattern) })
    );
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
      currentUser: CURRENT_USER,
      headers: {}
    };

    const getObjectsResponse = [
      { id: '123', name: 'foo' },
      { id: 'nonmatchingid', name: 'bar' }
    ];

    getObjectsSpy.mockResolvedValue(getObjectsResponse);
    getObjectSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await roadmapController.send(req as any, res as any, next);

    expect(getObjectsSpy).toHaveBeenCalledTimes(1);
    expect(getObjectsSpy).toHaveBeenNthCalledWith(1, req.headers, req.body.selectedFileIds);
    expect(getObjectSpy).toHaveBeenCalledTimes(2);
    expect(getObjectSpy).toHaveBeenNthCalledWith(1, req.headers, req.body.selectedFileIds[0]);
    expect(getObjectSpy).toHaveBeenNthCalledWith(2, req.headers, req.body.selectedFileIds[1]);
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
      currentUser: CURRENT_USER,
      headers: {}
    };

    const getObjectsResponse = [
      { id: '123', name: 'foo' },
      { id: 'nonmatchingid', name: 'bar' }
    ];

    const getObjectResponse = {
      data: 'foo',
      headers: {
        'content-type': 'filetype'
      },
      status: 200
    };

    getObjectsSpy.mockResolvedValue(getObjectsResponse);
    getObjectSpy.mockResolvedValue(getObjectResponse);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await roadmapController.send(req as any, res as any, next);

    expect(getObjectsSpy).toHaveBeenCalledTimes(1);
    expect(getObjectsSpy).toHaveBeenNthCalledWith(1, req.headers, req.body.selectedFileIds);
    expect(getObjectSpy).toHaveBeenCalledTimes(2);
    expect(getObjectSpy).toHaveBeenNthCalledWith(1, req.headers, req.body.selectedFileIds[0]);
    expect(getObjectSpy).toHaveBeenNthCalledWith(2, req.headers, req.body.selectedFileIds[1]);
    expect(emailSpy).toHaveBeenCalledTimes(0);
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
